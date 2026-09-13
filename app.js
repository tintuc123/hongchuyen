// ====== Logic popup quảng cáo (dùng chung, chỉ chạy nếu trang có popup) ======
const adLink = "https://s.shopee.vn/2BEPjZwbdB";

const adPopup = document.getElementById("adPopup");
const adImage = document.getElementById("adImage");
const adClose = document.getElementById("adClose");

let adClicked = false;

function handleAdClick() {
    if (!adClicked) {
        adClicked = true;
        window.open(adLink, "_blank");
    } else {
        adPopup.style.display = "none";
    }
}

if (adImage) adImage.addEventListener("click", handleAdClick);
if (adClose) adClose.addEventListener("click", handleAdClick);
