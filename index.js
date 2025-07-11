// index.js

import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid'

// — Hydrate from localStorage (safe JSON.parse)
let stored = null
try {
  stored = JSON.parse(localStorage.getItem('tweetsData'))
} catch {
  localStorage.removeItem('tweetsData')
}
if (Array.isArray(stored)) {
  tweetsData.splice(0, tweetsData.length, ...stored)
}

// — Helper to persist on every change
function saveTweets() {
  localStorage.setItem('tweetsData', JSON.stringify(tweetsData))
}

// — Central click listener
document.addEventListener('click', e => {
  // 1) Delete
  const del = e.target.closest('[data-delete]')
  if (del) {
    handleDeleteClick(del.dataset.delete)
    return
  }

  // 2) Submit reply
  if (e.target.dataset.replySubmit) {
    handleReplySubmit(e.target.dataset.replySubmit)
    return
  }

  // 3) Like
  if (e.target.dataset.like) {
    handleLikeClick(e.target.dataset.like)
    return
  }

  // 4) Retweet
  if (e.target.dataset.retweet) {
    handleRetweetClick(e.target.dataset.retweet)
    return
  }

  // 5) Toggle replies
  if (e.target.dataset.reply) {
    handleReplyClick(e.target.dataset.reply)
    return
  }

  // 6) New tweet
  if (e.target.id === 'tweet-btn') {
    handleTweetBtnClick()
    return
  }
})

// — Handlers
function handleLikeClick(id) {
  const t = tweetsData.find(t => t.uuid === id)
  t.isLiked = !t.isLiked
  t.likes += t.isLiked ? 1 : -1
  render()
  saveTweets()
}

function handleRetweetClick(id) {
  const t = tweetsData.find(t => t.uuid === id)
  t.isRetweeted = !t.isRetweeted
  t.retweets += t.isRetweeted ? 1 : -1
  render()
  saveTweets()
}

function handleReplyClick(id) {
  document.getElementById(`replies-${id}`).classList.toggle('hidden')
}

function handleReplySubmit(id) {
  const input = document.getElementById(`reply-input-${id}`)
  const text = input.value.trim()
  if (!text) return

  const t = tweetsData.find(t => t.uuid === id)
  t.replies.push({
    handle: '@Scrimba',
    profilePic: 'images/scrimbalogo.png',
    tweetText: text
  })
  input.value = ''
  // keep the replies open so the new one is visible
  document.getElementById(`replies-${id}`).classList.remove('hidden')
  render()
  saveTweets()
}

function handleTweetBtnClick() {
  const input = document.getElementById('tweet-input')
  const text = input.value.trim()
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
    uuid: uuidv4()
  })
  input.value = ''
  render()
  saveTweets()
}

function handleDeleteClick(id) {
  const idx = tweetsData.findIndex(t => t.uuid === id)
  if (idx > -1) {
    tweetsData.splice(idx, 1)
    render()
    saveTweets()
  }
}

// — Build the feed HTML
function getFeedHtml() {
  let html = ''

  tweetsData.forEach(tweet => {
    const likeClass = tweet.isLiked ? 'liked' : ''
    const rtClass   = tweet.isRetweeted ? 'retweeted' : ''

    // build existing replies
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

    // main tweet + replies + reply form
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
          <div class="reply-form">
            <textarea
              id="reply-input-${tweet.uuid}"
              placeholder="What's happening?"
              rows="3"
            ></textarea>
            <button
              class="reply-btn"
              data-reply-submit="${tweet.uuid}"
            >Reply</button>
          </div>
        </div>
      </div>`
  })

  return html
}

// — Render the feed
function render() {
  document.getElementById('feed').innerHTML = getFeedHtml()
}

// initial render
render()
