import { getMaterialData } from "./data.js";
const data = getMaterialData();
console.log(data);

function getTargetItemList() {
    return {
        "オークの板材": 6,
        "オークのハーフブロック": 3,
        "棒": 1
    }
}

function getWantedItems() {
    var itemDict = {}
    var wantedItemsText = document.getElementsById("itemList").value;
    var splitedItems = wantedItemsText.split("\n");
    var lineNum = 1;
    var wrongLineNum = [];
    for (const itemAndCount of splitedItems) {
        var itemArr = itemAndCount.split("*")
        if (itemArr.length != 2) {
            wrongLineNum.push(lineNum);
        }
        itemDict[itemArr[0]] = itemArr[1];
        lineNum++;
    }
    if (wrongLineNum.length == 0) {
        console.log(itemDict);
    } else {
        console.error(wrongLineNum)
        alert(wrongLineNum + "行目の書式が間違っています。")
    }
}

/**
 * 指定したアイテム (item) を needed 個手に入れるために、
 * leftover(在庫)を使い、足りなければレシピを1バッチずつクラフトして補充する。
 * usageはレシピを持たない(=基本素材)の最終使用数をカウントする。
 */
function getItem(item, needed, recipes, leftover, usage) {
    if (typeof leftover[item] === "undefined") {
        leftover[item] = 0;
    }

    // 在庫だけで足りる？
    if (leftover[item] >= needed) {
        leftover[item] -= needed;
        return;
    }

    // 在庫では足りない分
    needed -= leftover[item];
    leftover[item] = 0;

    if (recipes[item]) {
        // レシピがある → バッチ単位でクラフト
        const recipe = recipes[item];
        const outputCount = recipe.count;

        while (leftover[item] < needed) {
            // 材料を再帰的に確保
            for (const [mat, matNeed] of Object.entries(recipe.material)) {
                getItem(mat, matNeed, recipes, leftover, usage);
            }
            // 1回クラフト
            leftover[item] += outputCount;
        }
        // 必要数を消費
        leftover[item] -= needed;
    } else {
        // レシピなし → 基本素材
        if (typeof usage[item] === "undefined") {
            usage[item] = 0;
        }
        usage[item] += needed;
    }
}

function main() {
    const leftover = {}; // 各アイテムの在庫
    const usage = {}; // 基本素材の使用数

    // 必要なアイテムをすべて取得
    for (const [item, count] of Object.entries(getWantedItems)) {
        getItem(item, count, data, leftover, usage);
    }

    console.log("必要な基本素材の使用数:");
    for (const [mat, amt] of Object.entries(usage)) {
        console.log(`  ${mat}: ${amt}`);
    }

    console.log("\\n最終的な余り在庫:");
    for (const [mat, amt] of Object.entries(leftover)) {
        if (amt > 0) {
            console.log(`  ${mat}: ${amt}`);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("calcButton").addEventListener("click", main);
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("testButton").addEventListener("click", getWantedItems);
});