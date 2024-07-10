// ==UserScript==
// @name         Tabela komend w przegladzie gracza v2
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Doopcia
// @match        https://*.plemiona.pl/game.php*screen=info_player&id*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=plemiona.pl
// @grant        none
// ==/UserScript==


let mainTable = '<table class="vis" id="commandsTable" width="100%" style="border-collapse: separate; border-spacing: 2px; padding: 20px 10px 33px 10px;"><tbody>'+
    '<tr>' +
    '<th>Atakowana wioska</th>' +
    '<th >Agresor</th>' +
    '<th >Przybycie</th>' +
    '<th ></th>' +
    '<th ><img src="https://dspl.innogamescdn.com/asset/f0f06311/graphic/unit/unit_spear.png"></th>' +
    '<th ><img src="https://dspl.innogamescdn.com/asset/f0f06311/graphic/unit/unit_sword.png"></th>' +
    '<th ><img src="https://dspl.innogamescdn.com/asset/f0f06311/graphic/unit/unit_axe.png"</th>' +
    '<th ><img src="https://dspl.innogamescdn.com/asset/f0f06311/graphic/unit/unit_archer.png"</th>' +
    '<th ><img src="https://dspl.innogamescdn.com/asset/f0f06311/graphic/unit/unit_spy.png"</th>' +
    '<th ><img src="https://dspl.innogamescdn.com/asset/f0f06311/graphic/unit/unit_light.png"</th>' +
    '<th ><img src="https://dspl.innogamescdn.com/asset/f0f06311/graphic/unit/unit_marcher.png"</th>' +
    '<th ><img src="https://dspl.innogamescdn.com/asset/f0f06311/graphic/unit/unit_heavy.png"</th>' +
    '<th ><img src="https://dspl.innogamescdn.com/asset/f0f06311/graphic/unit/unit_ram.png"</th>' +
    '<th ><img src="https://dspl.innogamescdn.com/asset/f0f06311/graphic/unit/unit_catapult.png"</th>' +
    '<th ><img src="https://dspl.innogamescdn.com/asset/f0f06311/graphic/unit/unit_knight.png"</th>' +
    '<th ><img src="https://dspl.innogamescdn.com/asset/f0f06311/graphic/unit/unit_snob.png"</th>' +
    '</tr>';

function sortTable(tableId, n) {
    var table;
    table = document.getElementById(tableId);
    var rows, i, x, y, count = 0;
    var switching = true;

    // Order is set as ascending
    var direction = "ascending";

    // Run loop until no switching is needed
    while (switching) {
        switching = false;
        rows = table.rows;

        //Loop to go through all rows
        for (i = 1; i < (rows.length - 2); i++) {
            var Switch = false;

            // Fetch 2 elements that need to be compared
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];

            // Check the direction of order
            if (direction == "ascending") {

                // Check if 2 rows need to be switched
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase())
                {
                    // If yes, mark Switch as needed and break loop
                    Switch = true;
                    break;
                }
            } else if (direction == "descending") {

                // Check direction
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase())
                {
                    // If yes, mark Switch as needed and break loop
                    Switch = true;
                    break;
                }
            }
        }
        if (Switch) {
            // Function to switch rows and mark switch as completed
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;

            // Increase count for each switch
            count++;
        } else {
            // Run while loop again for descending order
            if (count == 0 && direction == "ascending") {
                direction = "descending";
                switching = true;
            }
        }
    }
}


function createSortButton(text, styleFloat, parentId, byColumn) {
    let btn = document.createElement("button");
    btn.innerHTML = text;
    btn.classList.add("btn");
    btn.style.position='relative';
    btn.style.bottom = '33px';
    btn.style.margin = '5px';
    btn.style.float = styleFloat;
    document.querySelector('#' + parentId).appendChild(btn);
    btn.onclick = function () {
        sortTable('commandsTable', byColumn);
    };
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function runScript(){

    console.log($('#villages_list td a').not('.ctx'))
    console.log($('#villages_list td a').not('.ctx').length)

    const links = $('#villages_list td a').not('.ctx');
    let villagesLinks = [];
    links.each(function () {
        const hasIncsOrNot = $(this)
        .parent()
        .parent()
        .parent()
        .parent()
        .parent()
        .parent()
        .parent()
        .find('> td:eq(1)')
        .find('span.command-attack-ally, span.command-attack');

        // only add village on the to be fetched list if there are incs going on this village
        if (hasIncsOrNot.length) {
            const villageLink = $(this).attr('href');
            villagesLinks.push(villageLink);
        }
    });

    console.log(villagesLinks)

    if(villagesLinks.length > 0){

        let fetchingErrorsCount = 0;

        var loading_gif = new Image();
        loading_gif.src = "https://dspl.innogamescdn.com/asset/a22f065/graphic/loading.gif";
        var elemLoading = document.getElementById('loadingDiv');
        //elemLoading.setAttribute('id','loadingDiv');
        elemLoading.appendChild(loading_gif);
        elemLoading.style.display = 'flex';
        elemLoading.style.justifyContent = 'center';
        elemLoading.style.padding = '50px';
        const target = document.getElementById("contentContainer");
        target.parentNode.insertBefore(elemLoading, target);

        var parser = new DOMParser();
        var pages = [];
        //fetching village pages
        for(let link in villagesLinks){
            let villagePage = await $.ajax({
                url:villagesLinks[link],
                type:'GET',
                success: function(data){
                    return data;
                }
                ,error: function(XMLHttpRequest, textStatus, errorThrown) {
                    console.log(++fetchingErrorsCount);
                }
            });
            pages.push(villagePage);
            await sleep(1);
        }

        //getting commands elements
        var targets = [];
        for(let str in pages){
            pages[str] = parser.parseFromString(pages[str], 'text/html');
            targets.push(pages[str].querySelectorAll('[data-command-type = attack]'));
        }
        delete(pages);
        //console.log(targets);

        //getting urls to commands
        var commandsUrlsSet = new Set();
        for(var i = 0; i < targets.length; i++){
            for(var j = 0; j < targets[i].length; j++){
                commandsUrlsSet.add(targets[i][j].parentElement.parentElement.getAttribute('href'));
            }
        }
        delete(targets);
        const commandsUrlsArr = Array.from(commandsUrlsSet);
        delete(commandsUrlsSet);

        //fetching commmands pages
        var commandPages = [];
        for(let link in commandsUrlsArr){
            let commandPage = await $.ajax({
                url:commandsUrlsArr[link],
                type:'GET',
                success: function(data){
                    return data;
                }
                ,error: function(XMLHttpRequest, textStatus, errorThrown) {
                    console.log(++fetchingErrorsCount);
                }
            });
            commandPages.push(commandPage);
            console.log('Fetched command');
            await sleep(10);
        }

        var attackIcons = ['https://dspl.innogamescdn.com/asset/f0f06311/graphic/command/attack_small.png',
                           'https://dspl.innogamescdn.com/asset/f0f06311/graphic/command/attack_medium.png',
                           'https://dspl.innogamescdn.com/asset/f0f06311/graphic/command/attack_large.png'];

        var smallCount = 0, mediumCount = 0, largeCount = 0;
        //var commands = [];
        for(let page in commandPages){
            commandPages[page] = parser.parseFromString(commandPages[page], 'text/html');

            var visTables = commandPages[page].getElementsByClassName("vis");
            var unitsRow = visTables[1].rows[1];

            var unitsCount = 0;
            for(let i = 0; i < unitsRow.childElementCount; i++){
                unitsCount += parseInt(unitsRow.childNodes[i].innerText);
            }

            var attackIcon;
            if(unitsCount < 1000){
                attackIcon = attackIcons[0];
                smallCount++;
            } else if(unitsCount < 5000){
                attackIcon = attackIcons[1];
                mediumCount++;
            }else{
                attackIcon = attackIcons[2];
                largeCount++;
            }

            var attackIconCell = unitsRow.insertCell(0);
            attackIconCell.style.width = '1%';
            let attackIconCellTextNode = document.createRange().createContextualFragment('<img class=' + attackIcon.slice(-16,-4) + ' style="margin-top: 3px;" src="' + attackIcon + '" >');
            attackIconCell.appendChild(attackIconCellTextNode);

            var arrivalTime = visTables[0].rows[visTables[0].rows.length - 4].innerText.slice(10);
            var arrivalCell = unitsRow.insertCell(0);
            let arrivalTimeTextNode = document.createTextNode(arrivalTime);
            arrivalCell.appendChild(arrivalTimeTextNode);

            var aggressorCell = unitsRow.insertCell(0);
            var aggressor = visTables[0].rows[1].cells[2].firstChild;
            aggressorCell.appendChild(aggressor);

            var villageCell = unitsRow.insertCell(0);
            var village = visTables[0].rows[4].cells[1].firstChild.firstChild;
            village.innerText = village.innerText.slice(0, -5);
            var villageEndText = village.innerText.slice(-9);
            village.innerText = villageEndText + ' ' + village.innerText.slice(0, -10);
            villageCell.appendChild(village);

            mainTable += unitsRow.outerHTML;
        }

        //console.log('mainTable', mainTable);
        var div_start = '<div id="commandsTableDiv" '+
            ' style="margin: 15px 0 30px 0; display:inline-block' +
            ' text-indent: 10px;' +
            ' border:1px solid #7d510f; box-sizing: border-box;' +
            ' background-color: #ead5aa"> ';
        var div_end_table = '</tbody></table>';
        var div_end = '</div>';

        let tableFooter = '<tfoot><tr>' +
            '<td colspan="4"></td>' +
            '<td colspan="3"><img style="margin-top: 3px;" src="https://dspl.innogamescdn.com/asset/f0f06311/graphic/buildings/barracks.png" > x ' + (largeCount + mediumCount + smallCount) + '</td></td>' +
            '<td colspan="3"><img style="margin-top: 3px;" src="' + attackIcons[2] + '" > x ' + largeCount + '</td>' +
            '<td colspan="3"><img style="margin-top: 3px;" src="' + attackIcons[1] + '" > x ' + mediumCount + '</td>' +
            '<td colspan="3"><img style="margin-top: 3px;" src="' + attackIcons[0] + '" > x ' + smallCount + '</td>' +
            '</tr></tfoot>';

        var NewStyles = `
#commandsTable td, #commandsTable th{
  white-space: nowrap;
  padding-left: 3px;
  padding-right: 3px;
}
#loadingDiv {
  display: flex;
  justify-content: center;
}
`;

        var styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = NewStyles;
        document.querySelector('#contentContainer').appendChild(styleSheet);
        elemLoading.remove();
        document.querySelector('#contentContainer').insertAdjacentHTML('beforebegin', div_start + mainTable + tableFooter + div_end_table + div_end);

        createSortButton("Uporządkuj nazwy wiosek", "left" , 'commandsTableDiv', 0);
        createSortButton("Sortuj po czasie", "left", 'commandsTableDiv', 2);
        createSortButton("Sortuj po agresorze", "left" , 'commandsTableDiv', 1);

        let filterBtn = document.createElement("button");
        filterBtn.classList.add("btn");
        filterBtn.innerHTML = 'Ukryj małe ataki';
        filterBtn.style.position='relative';
        filterBtn.style.bottom = '33px';
        filterBtn.style.margin = '5px';
        filterBtn.style.float = 'right';

        let hidden;
        filterBtn.onclick = function () {
            let toHide = $(".attack_small").parent().parent();
            if (hidden) {
                console.log('show');
                toHide.show();
                filterBtn.innerHTML = 'Ukryj małe ataki';
                hidden = false;
            } else {
                console.log('hide');
                toHide.hide();
                filterBtn.innerHTML = 'Wszystkie ataki';
                hidden = true;
            }
            window.scrollTo(0, 0);
        };

        document.querySelector('#commandsTableDiv').appendChild(filterBtn);
    }
}

function expandVillageList(){
    var villagesList = $('#villages_list')[0];
    var lastRowElement = villagesList.rows[villagesList.rows.length - 1].firstElementChild.firstElementChild
    if (lastRowElement.hasAttribute('onClick')) {
        lastRowElement.click();
    }
}

$( document ).ready(function() {
    let runButton = document.createElement("button");
    runButton.classList.add("btn");
    runButton.innerHTML = 'Wczytaj komendy';
    runButton.onclick = function () {
        this.style.display = 'none';
        runScript();
    }

    var elemRunButton = document.createElement("div");
    elemRunButton.setAttribute('id','loadingDiv');
    elemRunButton.appendChild(runButton);
    elemRunButton.style.display = 'flex';
    elemRunButton.style.justifyContent = 'center';
    elemRunButton.style.padding = '50px';
    const target = document.getElementById("contentContainer");
    target.parentNode.insertBefore(elemRunButton, target);

    expandVillageList();

});