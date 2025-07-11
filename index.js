import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid'

// — hydrate from localStorage (safe)
let stored = null
try {
  stored = JSON.parse(localStorage.getItem('tweetsData'))
} catch {
  localStorage.removeItem('tweetsData')
}
if (Array.isArray(stored)) {
  tweetsData.splice(0, tweetsData.length, ...stored)
}

function saveTweets() {
  localStorage.setItem('tweetsData', JSON.stringify(tweetsData))
}

document.addEventListener('click', e => {
  // delete
  const del = e.target.closest('[data-delete]')
  if (del)    return handleDeleteClick(del.dataset.delete)

  // submit a new reply
  if (e.target.dataset.replySubmit) {
    return handleReplySubmit(e.target.dataset.replySubmit)
  }
  // like
  if (e.target.dataset.like) {
    return handleLikeClick(e.target.dataset.like)
  }
  // retweet
  if (e.target.dataset.retweet) {
    return handleRetweetClick(e.target.dataset.retweet)
  }
  // toggle replies
  if (e.target.dataset.reply) {
    return handleReplyClick(e.target.dataset.reply)
  }
  // new tweet
  if (e.target.id === 'tweet-btn') {
    return handleTweetBtnClick()
  }
})

function handleLikeClick(id) {
  const t = tweetsData.find(t => t.uuid === id)
  t.isLiked = !t.isLiked
  t.likes += t.isLiked ? 1 : -1
  render(); saveTweets()
}

function handleRetweetClick(id) {
  const t = tweetsData.find(t => t.uuid === id)
  t.isRetweeted = !t.isRetweeted
  t.retweets += t.isRetweeted ? 1 : -1
  render(); saveTweets()
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
  // keep replies open so they see it
  document.getElementById(`replies-${id}`).classList.remove('hidden')
  render(); saveTweets()
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
  render(); saveTweets()
}

function handleDeleteClick(id) {
  const idx = tweetsData.findIndex(t => t.uuid === id)
  if (idx > -1) {
    tweetsData.splice(idx, 1)
    render(); saveTweets()
  }
}

function getFeedHtml() {
  let feedHtml = ''

  tweetsData.forEach(tweet => {
    const likeC = tweet.isLiked      ? 'liked' : ''
    const rtC   = tweet.isRetweeted  ? 'retweeted' : ''

    // build list of existing replies
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

    feedHtml += `
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
                <i class="fa-solid fa-heart ${likeC}"
                   data-like="${tweet.uuid}"></i>
                ${tweet.likes}
              </span>
              <span class="tweet-detail">
                <i class="fa-solid fa-retweet ${rtC}"
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

        <!-- replies + inline reply form -->
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
      `
  })

  return feedHtml
}


function render() {
  document.getElementById('feed').innerHTML = getFeedHtml()
}

// initial render
render()
