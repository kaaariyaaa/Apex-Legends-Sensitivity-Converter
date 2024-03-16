function calculate()
{
    const original_sens_magnification = document.getElementById("original_sens_magnification").value;

    const original_sens = document.getElementById("original_sens").value.split("/");
    const conversion_sens = document.getElementById("conversion_sens").value.split("/");

    const yaw1 = Number(original_sens[0]) * Number(original_sens_magnification);
    const yaw2 = Number(conversion_sens[0]);

    const pitch1 = Number(original_sens[1]) * Number(original_sens_magnification);
    const pitch2 = Number(conversion_sens[1]);

    const magnification_result = yaw1 / yaw2;
    const percentage_results = (pitch1 / pitch2) / magnification_result;


    if(magnification_result.toFixed(7) >= 0.2 && magnification_result.toFixed(6) <= 20) document.getElementById("magnification_result").textContent = magnification_result.toFixed(6);
    else document.getElementById("magnification_result").textContent = "変換できない感度です"
    if(percentage_results <= 1 && percentage_results >= 0.01) document.getElementById("percentage_results").textContent = (percentage_results * 100).toFixed(0);
    else document.getElementById("percentage_results").textContent = "変換できない感度です"
};