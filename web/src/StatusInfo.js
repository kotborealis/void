/**
 * Инфа о статусе программы
 * (Окошко, появляющееся при загрузке/ошибке
 */
const Controls = require("./Controls");
const StatusInfo = {};

StatusInfo.el = document.getElementById("info-status");

StatusInfo.set = (i)=>{
    switch(i){
        case -2:
            StatusInfo.el.textContent = Strings.badType;
            StatusInfo.show();
            Controls.enable();
            break;
        case -1:
            StatusInfo.el.textContent = Strings.error;
            StatusInfo.show();
            Controls.enable();
            break;
        case 0:
            StatusInfo.el.textContent = Strings.loading;
            StatusInfo.show();
            Controls.disable();
            break;
        case 2:
            StatusInfo.el.textContent = Strings.done;
            StatusInfo.show();
            Controls.enable();
            setTimeout(StatusInfo.hide,1000);
            break;
    }
};

StatusInfo.show = ()=>
    StatusInfo.el.classList.remove('c-tooltip--hide');
StatusInfo.hide = ()=>
    StatusInfo.el.classList.add('c-tooltip--hide');

const Strings = {
    "badType":"Wrong File Format",
    "error":"Error",
    "loading":"Loading...",
    "done":"Done"
};

module.exports = StatusInfo;