// buttons posts, dialogs
const createPostBtn = document.getElementById("create-post-btn");
const showStatsBtn = document.getElementById("show-stats-btn");

const articleDialog = document.getElementById("article-dialog");
const closeArticleDialogBtn = document.getElementById("close-article-dialog");
const cancelFormBtn = document.getElementById("cancel-form-btn");
const blogForm = document.getElementById("blog-form");

// form inputs
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");

// blog posts container and template
const blogCardsContainer = document.getElementById("blog-cards");
const blogCardTemplate = document.getElementById("blog-card-template");
const emptyPostsMessage = document.getElementById("empty-posts-message");

// pagination elements
const pagination = document.getElementById("pagination");
const prevPageBtn = document.getElementById("prev-page-btn");
const nextPageBtn = document.getElementById("next-page-btn");

// statistics dialog elements
const statsDialog = document.getElementById("stats-dialog");
const closeStatsDialogBtn = document.getElementById("close-stats-dialog");
const postsCountElement = document.getElementById("posts-count");

const yearElement = document.getElementById("footer-year").textContent = new Date().getFullYear();

const POSTS_STORAGE_KEY = "posts";
const POSTS_PER_PAGE = 6;

let posts = [];
let currentPage = 1;



// open and close article dialog
function openArticleDialog() {
    articleDialog.showModal();
}

function closeArticleDialog() {
    articleDialog.close();
}

// open, close statistics dialog
function openStatsDialog() {
    updatePostsCount();
    statsDialog.showModal();
}

function closeStatsDialog() {
    statsDialog.close();
}

// create current date for new post
function getCurrentPublishedDate() {
    const now = new Date();

    return now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

// load posts from localStorage into state
function loadPosts() {
    posts = JSON.parse(localStorage.getItem(POSTS_STORAGE_KEY)) || [];
}

// save current posts state to localStorage
function savePosts() {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
}

// total pages
function getTotalPages() {
    return Math.ceil(posts.length / POSTS_PER_PAGE) || 1;
}

// current page posts only
function getCurrentPagePosts() {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;

    return posts.slice(startIndex, endIndex);
}

// update posts count in statistics dialog
function updatePostsCount() {
    postsCountElement.textContent = posts.length;
}

// handling empty state and pagination visibility
function updateBlogPageState() {
    if (posts.length === 0) {
        emptyPostsMessage.hidden = false;
        pagination.hidden = true;
    } else {
        emptyPostsMessage.hidden = true;

        if (posts.length > POSTS_PER_PAGE) {
            pagination.hidden = false;
        } else {
            pagination.hidden = true;
        }
    }
}

// update prev / next buttons
function updatePaginationControls() {
    const totalPages = getTotalPages();

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

// create one post card from post object
function createPostCard(post) {
    const templateContent = blogCardTemplate.content.cloneNode(true);

    const postTitle = templateContent.querySelector(".template-post-title");
    const postText = templateContent.querySelector(".template-post-text");
    const postDate = templateContent.querySelector(".blog-card-date");

    postTitle.textContent = post.title;
    postText.textContent = post.content;
    postDate.textContent = `Published: ${post.date}`;

    return templateContent;
}

// render posts for current page
function renderPosts() {
    const currentPosts = getCurrentPagePosts();

    blogCardsContainer.innerHTML = "";

    currentPosts.forEach(function (post) {
        const postCard = createPostCard(post);
        blogCardsContainer.appendChild(postCard);
    });
}

// one render flow
function render() {
    const totalPages = getTotalPages();

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    renderPosts();
    updatePostsCount();
    updateBlogPageState();
    updatePaginationControls();
}

// add a new post using form data
function addPostFromForm() {
    const post = {
        title: titleInput.value.trim(),
        content: contentInput.value.trim(),
        date: getCurrentPublishedDate()
    };

    posts.push(post);
    savePosts();

    currentPage = getTotalPages();
    render();
}

// delete post when clicking delete button
blogCardsContainer.addEventListener("click", function (event) {
    const deleteBtn = event.target.closest(".delete-post-btn");

    if (!deleteBtn) {
        return;
    }

    const blogCard = deleteBtn.closest(".blog-card");

    if (!blogCard) {
        return;
    }

    const allCards = [...blogCardsContainer.querySelectorAll(".blog-card")];
    const cardIndexOnPage = allCards.indexOf(blogCard);
    const realIndex = (currentPage - 1) * POSTS_PER_PAGE + cardIndexOnPage;

    posts.splice(realIndex, 1);
    savePosts();

    render();
});

// pagination events
prevPageBtn.addEventListener("click", function () {
    if (currentPage > 1) {
        currentPage--;
        render();
    }
});

nextPageBtn.addEventListener("click", function () {
    if (currentPage < getTotalPages()) {
        currentPage++;
        render();
    }
});

// button actions
createPostBtn.addEventListener("click", openArticleDialog);
closeArticleDialogBtn.addEventListener("click", closeArticleDialog);

showStatsBtn.addEventListener("click", openStatsDialog);
closeStatsDialogBtn.addEventListener("click", closeStatsDialog);

// add post on form submit
blogForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addPostFromForm();
    blogForm.reset();
    closeArticleDialog();
});

// reset and close form on cancel button
cancelFormBtn.addEventListener("click", function () {
    blogForm.reset();
    closeArticleDialog();
});

// close dialogs when clicking outside the dialog content
articleDialog.addEventListener("click", function (event) {
    if (event.target === articleDialog) {
        closeArticleDialog();
    }
});

statsDialog.addEventListener("click", function (event) {
    if (event.target === statsDialog) {
        closeStatsDialog();
    }
});

// initial load and render
loadPosts();

render();