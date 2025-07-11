// index.js

import { tweetsData } from './data.js';
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

// — Hydrate from localStorage (safe JSON.parse)
let stored = null;
try {
  stored = JSON.parse(localStorage.getItem('tweetsData'));
} catch {
  localStorage.removeItem('tweetsData');
}
if (Array.isArray(stored)) {
  tweetsData.splice(0, tweetsData.length, ...stored);
}

// — Persist helper
function saveTweets() {
  localStorage.setItem('tweetsData', JSON.stringify(tweetsData));
}

// — Main click listener
document.addEventListener('click', e => {
  // 1) Toggle existing replies list
  if (e.target.dataset.toggleReplies) {
    const id = e.target.dataset.toggleReplies;
    document.getElementById(`replies-${id}`).classList.toggle('hidden');
    return;
  }

  // 2) Toggle reply form
  if (e.target.dataset.toggleForm) {
    const id = e.target.dataset.toggleForm;
    document.getElementById(`reply-form-${id}`).classList.toggle('hidden');
    return;
  }

  // 3) Submit a new reply
  if (e.target.dataset.replySubmit) {
    handleReplySubmit(e.target.dataset.replySubmit);
    return;
  }

  // 4) Like
  if (e.target.dataset.like) {
    handleLikeClick(e.target.dataset.like);
    return;
  }

  // 5) Retweet
  if (e.target.dataset.retweet) {
    handleRetweetClick(e.target.dataset.retweet);
    return;
  }

  // 6) Delete
  if (e.target.closest('[data-delete]')) {
    const id = e.target.closest('[data-delete]').dataset.delete;
    handleDeleteClick(id);
    return;
  }

  // 7) New tweet
  if (e.target.id === 'tweet-btn') {
    handleTweetBtnClick();
    return;
  }
});

// — Handlers

function handleLikeClick(id) {
  const t = tweetsData.find(t => t.uuid === id);
  if (!t) return;
  t.isLiked = !t.isLiked;
  t.likes += t.isLiked ? 1 : -1;
  render();
  saveTweets();
}

function handleRetweetClick(id) {
  const t = tweetsData.find(t => t.uuid === id);
  if (!t) return;
  t.isRetweeted = !t.isRetweeted;
  t.retweets += t.isRetweeted ? 1 : -1;
  render();
  saveTweets();
}

function handleReplySubmit(id) {
  const input = document.getElementById(`reply-input-${id}`);
  const text = input.value.trim();
  if (!text) return;

  const t = tweetsData.find(t => t.uuid === id);
  t.replies.push({
    handle: '@Scrimba',
    profilePic: 'images/scrimbalogo.png',
    tweetText: text
  });

  input.value = '';
  // keep the form and list open
  document.getElementById(`reply-form-${id}`).classList.remove('hidden');
  document.getElementById(`replies-${id}`).classList.remove('hidden');

  render();
  saveTweets();
}

function handleTweetBtnClick() {
  const input = document.getElementById('tweet-input');
  const text = input.value.trim();
  if (!text) return;

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
  });

  input.value = '';
  render();
  saveTweets();
}

function handleDeleteClick(id) {
  const idx = tweetsData.findIndex(t => t.uuid === id);
  if (idx > -1) {
    tweetsData.splice(idx, 1);
    render();
    saveTweets();
  }
}

// — Build feed HTML

function getFeedHtml() {
  let html = '';

  tweetsData.forEach(tweet => {
    const likeClass = tweet.isLiked ? 'liked' : '';
    const rtClass   = tweet.isRetweeted ? 'retweeted' : '';

    // existing replies
    let repliesHtml = '';
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
        </div>`;
    });

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
                   data-toggle-replies="${tweet.uuid}"></i>
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
                    title="Delete tweet">
                <i class="fa-solid fa-trash"></i>
              </span>
            </div>

            <button
              class="reply-toggle-btn"
              data-toggle-form="${tweet.uuid}"
            >Reply</button>
          </div>
        </div>

        <!-- hidden replies list -->
        <div class="hidden replies-list" id="replies-${tweet.uuid}">
          ${repliesHtml}
        </div>

        <!-- hidden inline reply form -->
        <div class="hidden reply-form" id="reply-form-${tweet.uuid}">
          <textarea
            id="reply-input-${tweet.uuid}"
            placeholder="What's happening?"
            rows="3"
          ></textarea>
          <button
            class="reply-submit-btn"
            data-reply-submit="${tweet.uuid}"
          >Submit</button>
        </div>
      </div>`;
  });

  return html;
}

// — Render

function render() {
  document.getElementById('feed').innerHTML = getFeedHtml();
}

// initial render
render();
