
const OurSeller = "Bookery On Main"

async function getHTML(url) {
    const res = await fetch(url, { mode: 'no-cors'});

    if (!res.ok)
        throw new Error(`[${res.status}] failed to fetch the product page: ${res.statusText}`);

    const text = await res.text();
    const parser = new DOMParser();
    const html = parser.parseFromString(text, 'text/html');

    return html;
}

async function checkBuybox(url, num){
    var html = await getHTML(url);

    if(checkMainBuybox(html)) return {"color": "green", "num": num, "pos": 1};
    pos = checkOtherBuybox(html);
    if(pos) return {"color": "yellow", "num": num, "pos": pos};

    return {"color": "red", "num": num, "pos": ""};
}

function checkMainBuybox(html){
    try{
        result = html.getElementById("sellerProfileTriggerId").innerText;
        str = result.replace((/  |\r\n|\n|\r/gm),"");
        if(str == OurSeller) return 1;
        return 0;
    }catch(err){
        console.error(err);
        return 0;
    }
}

function checkOtherBuybox(html){
    try{
        results = [];
        result = html.getElementsByClassName("mbcMerchantName");
        for(i=0;i<result.length;i++){
            innerCode = result[i].innerText;
            str = innerCode.replace((/  |\r\n|\n|\r/gm),"");
            
            if(str == OurSeller) return i+2;
        }
        return 0;
    } catch(err){
        console.error(err);
        return 0;
    }
}

var start = function(){
    productURLs = [];
    nodes = document.querySelectorAll(".mt-table-container table tbody tr:not(.head-row) td:nth-child(7) a")
    if(nodes.length == 0)
        nodes = document.querySelectorAll(".mt-table-container table tbody tr:not(.head-row) td:nth-child(6) a")
    // console.log("below are nodes");
    // console.log(nodes);
    rowNodes = document.querySelectorAll(".mt-table-container table tbody tr td:nth-child(11)")
    if(rowNodes.length == 0)
        rowNodes = document.querySelectorAll(".mt-table-container table tbody tr td:nth-child(6)")
    // console.log("below are rowNodes");
    // console.log(rowNodes);
    for(i=0;i<nodes.length;i++){
        productURL = nodes[i].href;
        productURLs[i] = productURL;
        
        checkBuybox(productURL, i)
        .then(res => {
            
            color = res.color;
            num = res.num;
            pos = res.pos;

            ref = rowNodes[num];
            newitem = document.createElement("div");
            addHtml = "<div><button style='background-color:" + color + "; width:20px;height:20px;'>" + pos + "</button></div>"
            newitem.innerHTML = addHtml;
            insertAfter(newitem, ref);         
        })
        .catch(err => alert(err));
        
    }

    refreshButtons();
    return productURLs;
}


function insertAfter(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

function addHeader(){
    ref = document.getElementById("floatingHeaderColumns").getElementsByTagName("th")[6];
    var newEl = document.createElement('th');
    newEl.innerHTML = '<div class="mt-layout-block">BuyBox</div></th>';
    insertAfter(newEl, ref);

    ref = document.getElementById("head-row").getElementsByTagName("th")[6];
    var newEl = document.createElement('th');
    newEl.innerHTML = '<div class="mt-layout-block">BuyBox</div></th>';
    insertAfter(newEl, ref);
}

var clickStart = function(){
    console.log("clicked next button");
    setTimeout(function() { start(); }, 3000);
}
// addHeader();
start();

var refreshButtons = function(){
    pagenations = document.querySelectorAll("#myitable-pagination a");
    for (var i = 0; i < pagenations.length; i++) {
        pagenations[i].addEventListener('click', clickStart, false);
    }
}
refreshButtons();