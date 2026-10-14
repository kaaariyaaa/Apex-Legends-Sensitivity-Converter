<script lang="ts">
  import { onMount } from 'svelte';
  import presetData from '../data/presets.json';
  import { formatArgumentValue } from '../lib/format-argument-value.mjs';

  type Preset = { id: string; name: string; description: string; options: string[]; source: string };
  type Registration = { name: string; default: string; value_kind: string; min_bound: string; max_bound: string; help: string; description: string; confidence: string; category: string };
  type SelectedOption = { name: string; value: string; preset?: boolean };
  type Ranking = { id: string; users: number; uses: number };
  const presets: Preset[] = presetData;

  export let base: string = '/';
  let options: Registration[] = [];
  let rankings: Ranking[] = [];
  let query = '';
  let selected: SelectedOption[] = [];
  let copied = false;
  let loading = true;
  let ga: Window['gtag'] | undefined;
  $: matches = options.filter((option) => `${option.name} ${option.category} ${option.help} ${option.description}`.toLowerCase().includes(query.toLowerCase())).slice(0, 80);
  $: command = selected.map(({ name, value }) => `+${name}${value ? ` ${formatArgumentValue(value)}` : ''}`).join(' ');
  $: rankedPresets = [...presets].sort((a, b) => (rankings.find((r) => r.id === b.id)?.users ?? 0) - (rankings.find((r) => r.id === a.id)?.users ?? 0));

  onMount(async () => {
    const measurementId = import.meta.env.PUBLIC_GA_MEASUREMENT_ID;
    if (measurementId) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){ window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', measurementId, { anonymize_ip: true });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.append(script);
      ga = window.gtag;
    }
    try {
      const [optionResponse, rankResponse] = await Promise.all([
        fetch(`${base}data/registrations.json`), fetch(`${base}data/preset-rankings.json`)
      ]);
      options = await optionResponse.json();
      rankings = (await rankResponse.json()).rankings ?? [];
    } catch (error) {
      console.error('Could not load option data', error);
    } finally {
      loading = false;
    }
  });

  function add(option: Registration) {
    if (!selected.some((item) => item.name === option.name)) selected = [...selected, { ...option, value: option.default ?? '' }];
  }
  function usePreset(preset: Preset) {
    selected = preset.options.map((line) => {
      const [name, ...value] = line.replace(/^[+-]/, '').split(' ');
      return { name, value: value.join(' '), preset: true };
    });
  }
  function reportPresetUsed(preset: Preset) {
    ga?.('event', 'preset_used', { preset_id: preset.id });
  }
  function reportSearch() {
    if (query.trim()) ga?.('event', 'view_search_results', { search_term: query.trim(), result_count: matches.length });
  }
  async function copyCommand() {
    await navigator.clipboard.writeText(command);
    ga?.('event', 'builder_copy', { selected_count: selected.length });
    copied = true;
    setTimeout(() => copied = false, 1600);
  }
</script>

<div class="shell">
  <header class="topbar">
    <a class="brand" href={base}><span class="brand-mark">D</span><span>DROPZONE<span class="brand-sub">APEX CONFIG LAB</span></span></a>
    <span class="season"><i></i> DATASET / DX12 STATIC REGISTRY</span>
    <a class="top-link" href="https://help.ea.com/ja/articles/apex-legends/change-and-cap-fps/" target="_blank" rel="noreferrer">EA公式ヘルプ ↗</a>
  </header>

  <main>
    <section class="hero">
      <div class="eyebrow"><span>LOADOUT ENGINE</span><span class="eyebrow-line"></span><span>v1.0.0</span></div>
      <h1>起動オプションを、<em>組み立てる。</em></h1>
      <p>項目を選んで、あなたの環境に合わせた起動オプションを作成。</p>
    </section>

    <section class="builder-grid">
      <div class="panel registry-panel">
        <div class="panel-head"><div><div class="panel-kicker">01 / REGISTRY</div><h2>項目を探す</h2></div><span class="count">{options.length.toLocaleString()} <small>ENTRIES</small></span></div>
        <label class="search"><span>⌕</span><input bind:value={query} on:change={reportSearch} placeholder="名前、カテゴリ、説明で検索" /><kbd>↵</kbd></label>
        <div class="result-head"><span>登録名</span><span>既定値</span></div>
        <div class="results">
          {#if loading}<div class="empty">データを読み込み中…</div>
          {:else if matches.length === 0}<div class="empty">該当する項目がありません。</div>
          {:else}
            {#each matches as option (option.name)}
              <button class="option-row" on:click={() => add(option)} disabled={selected.some((item) => item.name === option.name)}>
                <span><strong>{option.name}</strong><small>{option.category || option.value_kind || '登録情報'}</small></span>
                <code>{option.default ?? '—'}</code><span class="add">{selected.some((item) => item.name === option.name) ? '✓' : '+'}</span>
              </button>
            {/each}
          {/if}
        </div>
        <p class="registry-note">登録情報を起動引数として組み立てます。Apexでの有効性は項目ごとに異なり、未確認のものも含まれます。</p>
      </div>

      <div class="right-column">
        <section class="panel output-panel">
          <div class="panel-head"><div><div class="panel-kicker">02 / YOUR BUILD</div><h2>作成中のオプション</h2></div><button class="text-button" on:click={() => selected = []} disabled={!selected.length}>クリア ↗</button></div>
          <div class="selected-list">
            {#if selected.length}
              {#each selected as item, i (item.name)}
                <div class="selected-row"><code>+{item.name}</code><input aria-label="値" bind:value={selected[i].value} on:input={() => selected = selected} /><button aria-label="削除" on:click={() => selected = selected.filter((_, index) => index !== i)}>×</button></div>
              {/each}
            {:else}<div class="empty build-empty"><span class="empty-icon">＋</span>左の項目から追加するか、プリセットを選択</div>{/if}
          </div>
          <div class="command-label">LAUNCH ARGUMENTS</div>
          <div class="command-box"><code>{command || '選択した項目がここに表示されます'}</code></div>
          <button class="copy-button" disabled={!command} on:click={copyCommand}><span>{copied ? 'コピーしました' : '起動オプションをコピー'}</span><span>{copied ? '✓' : '↗'}</span></button>
        </section>

        <section class="panel presets-panel">
          <div class="panel-head"><div><div class="panel-kicker">03 / COMMUNITY</div><h2>プリセット</h2></div><span class="live-tag"><i></i> 30 DAYS</span></div>
          <p class="preset-intro">使ったプリセットを申告すると、ランキングに反映されます。</p>
          {#each rankedPresets as preset, index (preset.id)}
            {@const rank = rankings.find((item) => item.id === preset.id)}
            <article class="preset-card">
              <div class="rank">{rank ? String(index + 1).padStart(2, '0') : '—'}</div>
              <div class="preset-info"><div class="preset-title">{preset.name}<span class="rank-count">{rank ? `${rank.users} USERS` : '集計待ち'}</span></div><p>{preset.description}</p><code>{preset.options.join(' ')}</code></div>
              <div class="preset-actions"><button class="apply" on:click={() => usePreset(preset)}>構成へ</button><button class="copy-small" on:click={() => reportPresetUsed(preset)}>使った</button></div>
            </article>
          {/each}
          <div class="ranking-foot">ランキングはGA4の集計後に更新されます。<a href="https://help.ea.com/ja/articles/apex-legends/change-and-cap-fps/" target="_blank" rel="noreferrer">設定の根拠 ↗</a></div>
        </section>
      </div>
    </section>
    <footer><span>DROPZONE <span class="footer-dot">●</span> COMMUNITY BUILT</span><span>ゲームのアップデートで動作しなくなる項目があります。</span></footer>
  </main>
</div>
