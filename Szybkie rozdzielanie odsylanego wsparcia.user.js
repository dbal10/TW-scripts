// ==UserScript==
// @name         Szybkie rozdzielanie odsylanego wsparcia
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Doopcia
// @match        https://*.plemiona.pl/game.php?*screen=info_village*
// @match        https://*.plemiona.pl/game.php?*screen=place&mode=units*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

///TODO: tabela zliczająca

function selectOwnVillages(){
    var tableDefense = $('.vis');
    tableDefense = tableDefense[tableDefense.length - 1];
    for (var k = 0, row; row = tableDefense.rows[k]; k++) {
        //iterate trough first collumn cells
        var col = row.cells[0]

        if(col.children.length == 1){
            if(col.children[0].tagName == 'A'){
                if(col.children[0].getAttribute('href') != '#'){
                    if(row.cells[14].children[0]){
                        row.cells[14].children[0].click();
                    }
                }
            }
        }
    }
    changeUnitsBorderColor('#6c4824');
}

function changeUnitsBorderColor(color){
    var unitsImages = $('[onclick="changeSelecition(this)"]');
    unitsImages.each(function( index ) {
        $(this).css('border-color', color);
    });
}

function useBin(){
    changeUnitsBorderColor('#d2c09e');

    var unitListToDelete = $('input:enabled.call-unit-box');
    for(var i = 0; i < unitListToDelete.length; i ++){
        unitListToDelete[i].setAttribute('value', '0');
    }
    return;
}

function selectKnight(){
    var tableDefense = $('.vis');
    tableDefense = tableDefense[tableDefense.length - 1];

    var rowsWithKnight = [];
    for (var k = 1, row; row = tableDefense.rows[k]; k++) {
        //iterate trough first collumn cells
        if(row.cells[11]){
            if(row.cells[11].firstElementChild){
                if(row.cells[11].firstElementChild.getAttribute('max') == '1'){ //if has knight
                    rowsWithKnight.push(k);
                }
            }
        }
    }

    useBin();
    //console.log(rowsWithKnight)

    for (var i = 0; i < rowsWithKnight.length; i++){
        //console.log(tableDefense.rows[rowsWithKnight[i]])
        for (var j = 1; j < tableDefense.rows[rowsWithKnight[i]].cells.length - 2; j++) {
            //console.log(tableDefense.rows[rowsWithKnight[i]].cells[j])
            if(tableDefense.rows[rowsWithKnight[i]].cells[j].firstElementChild.getAttribute('value')){
                //console.log(tableDefense.rows[rowsWithKnight[i]].cells[j].firstElementChild.getAttribute('value'))
                tableDefense.rows[rowsWithKnight[i]].cells[j].firstElementChild.setAttribute('value', String(tableDefense.rows[rowsWithKnight[i]].cells[j].firstElementChild.getAttribute('max')));
                //console.log(rowsWithKnight.cells[i]);
            }
        }
    }
}

let changeSelecition = (image) => {
    var specifiedUnitList = $('.unit-item-'+ image.id + '.has-input');
    var element;

    if(image.id == 'knight' && $('.unit-item-'+ image.id + '.has-input')[0].firstChild){
        if(image.style.borderColor == $('#spear').css('borderColor')){
            selectKnight();
            image.style.borderColor = '#6c4824';
        }else{
            useBin();
        }
        return;
    }

    for(var i = 0; i < specifiedUnitList.length; i ++){
        element = specifiedUnitList[i].firstChild;
        //console.log(element);
        if(element){
            if(element.getAttribute('value') == element.getAttribute('max')){
                element.setAttribute('value', '0');
                image.style.borderColor = '#d2c09e';
            }else if(element.getAttribute('value') == '0'){
                element.setAttribute('value', String(element.getAttribute('max')));
                image.style.borderColor = '#6c4824';
            };
        }
    }
}

function odeslij(){
    $('[value=odeślij]')[1].click();
}

$( document ).ready(function() {
    var form = $('.vis')
    form = form[form.length - 1];
    var firstCellWidth = form.rows[0].cells[0].offsetWidth;
    var lastCellWidth = form.rows[0].cells[14].offsetWidth;

    window.changeSelecition = changeSelecition;
    window.selectOwnVillages = selectOwnVillages;
    window.useBin = useBin;
    window.odeslij = odeslij;

    var units = ["spear", "sword", "axe", "archer", "spy", "light", "marcher", "heavy", "ram", "catapult", "knight"];
    let unitsHTML = "";
    //blank wide cell
    unitsHTML += '<div id="blankCell1"><button type="button" class="btn" onClick=selectOwnVillages() style="float: right; padding:6px; margin:5px 45px 5px 5px; top: "50%""">Własne wioski</button></div>';

    //units images
    for(var i = 0; i < units.length; i ++){
        unitsHTML += "<img id='" + units[i] + "' style='display: inline-block; padding: 9.5px ; border: 2px solid #d2c09e; margin-left:2px' " +
            "onClick=changeSelecition(this) src='graphic/unit/unit_" + units[i] + ".png'/>";
    }

    //blank icon cell
    unitsHTML += "<div style='display:inline-block; width:41px; height:38px; margin-left:2px'><span></span></div>"

    //bin icon
    unitsHTML += "<img id='clear' onClick=useBin() style='display:inline-block; padding: 10px 11.5px 10px 11.5px;margin-left:2px;margin-right:5px'" +
        "onClick=changeSelecition(this) src='https://dspl.innogamescdn.com/asset/f0f06311/graphic/igm/delete.png'/>";

    //button
    unitsHTML += '<div id=buttonDiv class=center></div'

    var logo = document.createElement("div");
    logo.id = "backSupportDiv";
    logo.style.maxHeight="41px"
    logo.innerHTML = unitsHTML;


    var x = document.getElementById("withdraw_selected_units_village_info");
    x.before(logo);


    document.getElementById('blankCell1').setAttribute("style","position:relative; display:inline-block; width:" + firstCellWidth + "px; height: 41px; margin-right:2px");
    document.getElementById('buttonDiv').setAttribute("style","position:relative; display:inline-block; width:" + lastCellWidth + "px; height: 41px; bottom:15px;");

    var odeslijBtn = $('[value=odeślij]').clone();
    odeslijBtn.attr('onClick', 'odeslij()');
    odeslijBtn.appendTo('#buttonDiv');
});
