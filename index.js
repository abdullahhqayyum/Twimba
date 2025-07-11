// index.js

import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid'

// — Hydrate from localStorage (safe JSON.parse)
let storedTweets = null
try {
  storedTweets = JSON.parse(localStorage.getItem('tweetsData'))
} catch (err) {
  console.warn('Could not parse stored tweets, clearing bad data:', err)
  localStorage.removeItem('tweetsData')
}

if (Array.isArray(storedTweets)) {
  // overwrite the imported default array
  tweetsData.splice(0, tweetsData.length, ...storedTweets)
}

// — Helper to persist on every change
function saveTweets() {
  localStorage.setItem('tweetsData', JSON.stringify(tweetsData))
}

// — Central click listener with delegation
document.addEventListener('click', function(e) {
  // 1) Delete (closest matches even if you click the <span> around the <i>)
  const delBtn = e.target.closest('[data-delete]')
  if (delBtn) {
    handleDeleteClick(delBtn.dataset.delete)
    return
  }

  // 2) Like
  if (e.target.dataset.like) {
    handleLikeClick(e.target.dataset.like)
    return
  }
  // 3) Retweet
  if (e.target.dataset.retweet) {
    handleRetweetClick(e.target.dataset.retweet)
    return
  }
  // 4) Toggle replies
  if (e.target.dataset.reply) {
    handleReplyClick(e.target.dataset.reply)
    return
  }
  // 5) Post new tweet
  if (e.target.id === 'tweet-btn') {
    handleTweetBtnClick()
    return
  }
})

function handleLikeClick(tweetId) {
  const tweet = tweetsData.find(t => t.uuid === tweetId)
  if (!tweet) return

  tweet.isLiked = !tweet.isLiked
  tweet.likes += tweet.isLiked ? 1 : -1

  render()
  saveTweets()
}

function handleRetweetClick(tweetId) {
  const tweet = tweetsData.find(t => t.uuid === tweetId)
  if (!tweet) return

  tweet.isRetweeted = !tweet.isRetweeted
  tweet.retweets += tweet.isRetweeted ? 1 : -1

  render()
  saveTweets()
}

function handleReplyClick(tweetId) {
  document
    .getElementById(`replies-${tweetId}`)
    .classList.toggle('hidden')
}

function handleTweetBtnClick() {
  const inputEl = document.getElementById('tweet-input')
  const text = inputEl.value.trim()
  if (!text) return

  tweetsData.unshift({
    handle: '@Scrimba',
    profilePic: 'images/scrimbalogo.png',
    likes: 0,
    retweets: 0,
    tweetText: text,
    replies: [],
    isLiked: false,
    isRetweeted: false,
    uuid: uuidv4(),
  })

  inputEl.value = ''
  render()
  saveTweets()
}

function handleDeleteClick(tweetId) {
  const idx = tweetsData.findIndex(t => t.uuid === tweetId)
  if (idx !== -1) {
    tweetsData.splice(idx, 1)
    render()
    saveTweets()
  }
}

function getFeedHtml() {
  let html = ''

  tweetsData.forEach(tweet => {
    const likeClass = tweet.isLiked ? 'liked' : ''
    const rtClass = tweet.isRetweeted ? 'retweeted' : ''

    // build replies
    let repliesHtml = ''
    tweet.replies.forEach(r => {
      repliesHtml += `
        <div class="tweet-reply">
          <div class="tweet-inner">
            <img src="${r.profilePic}" class="profile-pic">
            <div>
              <p class="handle">${r.handle}</p>
              <p class="tweet-text">${r.tweetText}</p>
            </div>
          </div>
        </div>`
    })

    html += `
      <div class="tweet">
        <div class="tweet-inner">
          <img src="${tweet.profilePic}" class="profile-pic">
          <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
              <span class="tweet-detail">
                <i class="fa-regular fa-comment-dots" 
                   data-reply="${tweet.uuid}"></i>
                ${tweet.replies.length}
              </span>
              <span class="tweet-detail">
                <i class="fa-solid fa-heart ${likeClass}"
                   data-like="${tweet.uuid}"></i>
                ${tweet.likes}
              </span>
              <span class="tweet-detail">
                <i class="fa-solid fa-retweet ${rtClass}"
                   data-retweet="${tweet.uuid}"></i>
                ${tweet.retweets}
              </span>
              <span class="tweet-detail" 
                    data-delete="${tweet.uuid}" 
                    title="Delete this tweet">
                <i class="fa-solid fa-trash"></i>
              </span>
            </div>
          </div>
        </div>
        <div class="hidden" id="replies-${tweet.uuid}">
          ${repliesHtml}
        </div>
      </div>`
  })

  return html
}

function render() {
  document.getElementById('feed').innerHTML = getFeedHtml()
}

// initial render
render()
