const puppeteer = require('puppeteer')
let link = 'https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq'
let cTab


(async function(){
    try {
        let browserOpen = puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args:['--start-maximized']
        })
        let browserInstance = await browserOpen
        let allTabsArr = await browserInstance.pages()
        cTab = allTabsArr[0]
        await cTab.goto(link)
        await cTab.waitForSelector('h1#title')
        let name = await cTab.evaluate(function(select){return document.querySelector(select).innerText}, 'h1#title')
        //console.log(name)
        let allData = await cTab.evaluate(getData, '#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer')
        console.log(name, allData.noOfVideos)
    
        let totalVideos = allData.noOfVideos.split(" ")[0]
        console.log(totalVideos)

        let currentVideos = await currentVideosLen()
        console.log(currentVideos)   
        
        while(totalVideos - currentVideos >= 20){
            await scrollToBottom()
            currentVideos = await currentVideosLen()
        }

        let finalList = await getStats()
        console.log(finalList)

    } catch (error) {

    }
})()


function getData(selector) {
    let allElems = document.querySelectorAll(selector)
    let noOfVideos = allElems[0].innerText

    return {
        noOfVideos
    }
}

async function currentVideosLen(){
    let length = await cTab.evaluate(getLength, '#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer')
    return length
}

function getLength(durationSelect){
    let durationElem = document.querySelectorAll(durationSelect)
    return durationElem.length

}

async function scrollToBottom(){
    await cTab.evaluate(goToBottom)
    function goToBottom(){
        window.scrollBy(0 , window.innerHeight)
    }
}

async function getStats(){
    let list = cTab.evaluate(getNameAndDuration, "#video-title", "#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer")
    return list
}


function getNameAndDuration(videoSelector, durationSelector){
    let videoElem = document.querySelectorAll(videoSelector)
    let durationElem = document.querySelectorAll(durationSelector)
    let currentList = []
    
    for(let i =0; i<durationElem.length; i++){
        let videoTitle = videoElem[i].innerText
        let duration = durationElem[i].innerText
        currentList.push({videoTitle, duration})

    }
    return currentList

}