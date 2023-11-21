import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

// VARIABLES //

// Modals
const job_post_modal = document.getElementById('job-post-modal');
const job_post_modal_bs = new bootstrap.Modal(document.getElementById('job-post-modal'));
const job_likes_modal = new bootstrap.Modal(document.getElementById('job-likes-modal'));
const confirm_delete_modal = new bootstrap.Modal(document.getElementById('confirm-delete-modal'));
const confirm_delete_btn = document.getElementById('confirm-delete-btn');

// Navbar
const navbar_brand = document.getElementById('navbar-title');
const navbar_links = document.querySelectorAll('.navbar .nav-link');
const navbar_login = document.getElementById('nav-login');
const navbar_logout = document.getElementById('logout-btn');

// Pages
const pages = document.getElementsByClassName('page');
const login_register_page = document.getElementById('login-register-page');
const feed_page = document.getElementById('feed-page');
const profile_page = document.getElementById('profile-page');

// Login/registration
const login_btn = document.getElementById('login-button');
const register_btn = document.getElementById('register-button');
const register_name = document.getElementById('register-name');
const login_email = document.getElementById('login-email');
const login_password = document.getElementById('login-password');
const register_email = document.getElementById('register-email');
const register_password = document.getElementById('register-password');
const register_confirm_password = document.getElementById('register-confirm-password');
const toggle_password_btns = document.getElementsByClassName('toggle-password');
const login_tab = document.getElementById('login-tab');
const register_tab = document.getElementById('register-tab');
const show_login_elems = document.getElementsByClassName('show-login');
const show_register_elems = document.getElementsByClassName('show-register');
const show_login_btn = document.getElementById('show-login-btn');
const show_register_btn = document.getElementById('show-register-btn');

// Jobs
const job_modal_header = document.getElementById('job-post-modal-header');
const submit_job_btn = document.getElementById('submit-job-post-btn');
const create_job_title = document.getElementById('job-post-title');
const create_job_date = document.getElementById('job-post-date');
const create_job_description = document.getElementById('job-post-description');
const create_job_img = document.getElementById('job-post-file');

// Job feed
const job_feed_empty = document.getElementById('job-feed-empty');
const job_feed_list = document.getElementById('feed-list');
const job_likes_list = document.getElementById('job-likes-list');
const feed_user_profile_col = document.getElementById('user-profile-col');
const job_likes_modal_header_name = document.getElementById('job-likes-modal-header-title');

// Update user info
const user_info_modal = new bootstrap.Modal(document.getElementById('update-user-info-modal'));
const user_info_email = document.getElementById('user-info-email');
const user_info_password = document.getElementById('user-info-password');
const user_info_confirm_password = document.getElementById('user-info-confirm-password');
const user_info_name = document.getElementById('user-info-name');
const user_info_image = document.getElementById('user-info-picture');
const user_info_submit = document.getElementById('update-user-info-btn');

// TEMPLATES //
const job_post = (id, title, description, start_date, image, posted_by_name, posted_by_id, date_posted, num_likes, num_comments, comments, liked, liked_users) => `
    <div class="job-post-container container mb-5" data-id="${id}">
        <div class="row d-flex align-items-center justify-content-center">
            <div class="card">
                <div class="d-flex justify-content-between p-2 px-3">
                    <div class="d-flex flex-row align-items-center">
                        <div class="d-flex flex-column ml-2">
                            <span class="font-weight-bold">Posted by <a class="user-link" data-id="${posted_by_id}" href="#user?userId=${posted_by_id}">${posted_by_name}</a></span>
                        </div>
                    </div>
                    <div class="d-flex flex-row ellipsis">
                        <span class="mr-2 text-body-secondary">${date_posted}</span>
                    </div>
                </div>
                <div class="d-flex justify-content-center">
                    ${image}
                </div>
                <div class="p-2">
                    <h3 class="job-title">${title}</h3>
                    <h6 class="text-justify">Starts on: ${start_date}</h6>
                    <p class="text-justify">${description}</p>
                    <hr>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex flex-row icons d-flex align-items-center">
                            <i class="like-job-btn bi ${liked} me-2 text-danger" data-id="${id}"></i><a class="job-likes" data-bs-toggle="modal" data-bs-target="#job-likes-modal" data-job_name="${title}" data-user_ids="${liked_users}" href="#">${num_likes} likes</a>
                        </div>
                        <div class="d-flex flex-row muted-color">
                            <span>${num_comments} comments</span>
                            </div>
                    </div>
                    <hr>
                    <div class="comments">
                        ${comments}
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

const job_post_comment = (commenter_name, commenter_id, comment) => `
    <div class="d-flex flex-row mb-2 ps-2 border rounded">
        <div class="d-flex flex-column ml-2">
            <a class="comment-name user-link" data-id="${commenter_id}" href="#user?userId=${commenter_id}">${commenter_name}</a>
            <small class="comment-text">${comment}</small>
        </div>
    </div>
`;

const job_post_comment_input = (id) => `
    <div class="comment-input">
        <textarea type="text" class="form-control job-post-comment-input"></textarea>
        <div class="mt-2 d-flex justify-content-end">
            <button type="button" class="btn btn-secondary job-post-comment-btn" data-id="${id}">Post comment</button>
        </div>
    </div>
`;

const profile_page_info = (name, email, picture, num_followers, button, followers_list, jobs_list) => `
    <div class="container">
        <div class="main-body">
            <div class="row gutters-sm">
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex flex-column align-items-center text-center">
                                <img src="${picture}" alt="Profile picture" class="rounded-circle" width="150">
                                <div class="mt-3">
                                    <h4>${name}</h4>
                                    <p class="text-muted font-size-sm">${num_followers}</p>
                                    ${button}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-sm-3">
                                    <h6 class="mb-0">Name</h6>
                                </div>
                                <div class="col-sm-9 text-secondary">
                                    ${name}
                                </div>
                            </div>
                            <hr>
                            <div class="row">
                                <div class="col-sm-3">
                                    <h6 class="mb-0">Email</h6>
                                </div>
                                <div class="col-sm-9 text-secondary">
                                    ${email}
                                </div>
                            </div>
                            <hr>
                            <div class="row">
                                <div class="col-sm-3">
                                    <h6 class="mb-0">Followers</h6>
                                </div>
                                <div class="col-sm-9 text-secondary">
                                    ${followers_list}
                                </div>
                            </div>
                            <hr>
                            <div class="row">
                                <div class="col-sm-3">
                                    <h6 class="mb-0">Job postings</h6>
                                </div>
                                <div class="col-sm-9 text-secondary">
                                    ${jobs_list}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

const profile_page_edit_btn = (id) => `
    <div class="row">
        <div class="col-sm-12">
            <button type="button" id="edit-user-info" class="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#update-user-info-modal" data-id="${id}">Edit</button>
        </div>
    </div>
`;

const profile_page_follow_btn = (id, email, mode, text) => `
    <div class="row">
        <div class="col-sm-12">
            <button id="user-profile-follow" class="btn btn-secondary" data-id="${id}" data-email="${email}" data-mode="${mode}">${text}</button>
        </div>
    </div>
`;

const user_profile_card = (picture, id, name, email, num_followers) => `
    <div class="container mb-4 d-flex justify-content-center user-profile-card">
        <div class="card p-4">
            <div class="image d-flex flex-column justify-content-center align-items-center">
                <button class="btn btn-secondary">
                    <img src="${picture}" height="100" width="100"/></button>
                    <span class="mt-3">${name}</span>
                    <div class="d-flex flex-row justify-content-center align-items-center gap-2">
                        <span>${email}</span>
                    </div>
                    <div class="d-flex flex-row justify-content-center align-items-center mt-3">
                        <span>${num_followers}</span>
                    </div>
                    <div class="d-flex mt-2">
                        <button id="view-profile-btn" class="btn btn-dark" data-id="${id}">View profile</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

// FUNCTIONS
const clearList = (parent, except=undefined) => {
    [...parent.children].forEach((child) => {
        if (except && except === child.id);
        else parent.removeChild(child);
    });
}

//Dashboard
function getFeed() {
    feed_user_profile_col.innerHTML = '';
    apiCall('job/feed?start=0', 'GET', {}).then(data =>{
        let feed_promises = [];
        feed_promises.push(
            new Promise((resolve) => {
                apiCall(`user?userId=${getUserId()}`, 'GET', {}).then(function(data) {
                    let followers = '';
                    if (data.watcheeUserIds.length === 1) {
                        followers = '1 follower'
                    } else {
                        followers = `${data.watcheeUserIds.length} followers`
                    }
                    feed_user_profile_col.insertAdjacentHTML('beforeend',
                        user_profile_card(
                            data.image ?? 'https://i.pinimg.com/originals/f1/0f/f7/f10ff70a7155e5ab666bcdd1b45b726d.jpg',
                            data.id,
                            data.name,
                            data.email,
                            followers
                        )
                    );
                }).then(function() {
                    resolve();
                });
            })
        );
        if (data.length === 0) {
            job_feed_list.innerHTML = '';
            job_feed_empty.classList.remove('hidden');
        } else {
            job_feed_list.innerHTML = '';
            job_feed_empty.classList.add('hidden');
            for (let i = 0; i < data.length; i++) {
                feed_promises.push(
                    new Promise((resolve) => {
                        apiCall(`user?userId=${data[i].creatorId}`, 'GET', {}).then(function(res) {
                            job_feed_list.insertAdjacentHTML('beforeend', showdetail(res, data[i]));
                        }).then(function() {
                            resolve()
                        });
                    })
                );
            }
        }
        Promise.all(feed_promises).then(function() {
            initialiseJobFeedListeners();
        });
    });
}

function showdetail(user, job) {
    let comments = '';
    if (job.comments.length > 0) {
        for (let i = 0; i < job.comments.length; i++) {
            comments += job_post_comment(job.comments[i].userName, job.comments[i].userId, job.comments[i].comment);
        }
    }
    comments += job_post_comment_input(job.id);

    let liked = 'bi-heart';
    let liked_users = [];
    if (job.likes.length > 0) {
        for (let i = 0; i < job.likes.length; i++) {
            if (job.likes[i].userId == getUserId()) {
                liked = 'bi-heart-fill';
            }
            liked_users.push(job.likes[i].userId);
        }
    }

    let image_elem = '';
    if (job.image != null) {
        image_elem = `<img class="img-fluid" src="${job.image}"/>`;
    }

    return job_post(job.id, job.title, job.description, startdate(job.start), image_elem, user.name, user.id, postdate(job.createdAt), job.likes.length, job.comments.length, comments, liked, liked_users.join(','));
}

const toProfilePage = (userId) => {
    profile_page.innerHTML = '';
    navigateTo('profile');
    setNavbarActive('profile');
    apiCall(`user?userId=${userId}`, 'GET', {}).then(res => {
        let num_followers = '';
        if (res.watcheeUserIds.length === 1) {
            num_followers = '1 follower';
        } else  {
            num_followers = `${res.watcheeUserIds.length} followers`;
        }
        let edit_or_follow_btn = '';
        if (localStorage.getItem('userid') == res.id) {
            edit_or_follow_btn = profile_page_edit_btn(res.id);
        } else {
            let following = false;

            let id = res.id;
            let email = res.email;
            let mode = '';
            let text = '';
            for (let i = 0; i < res.watcheeUserIds.length; i++) {
                if (res.watcheeUserIds[i] == localStorage.getItem('userid')) {
                    following = true;
                }
            }

            if (following) {
                mode = 'unwatch';
                text = 'Unwatch';
            } else {
                mode = 'watch';
                text = 'Watch';
            }

            edit_or_follow_btn = profile_page_follow_btn(id, email, mode, text);
        }

        let followers_list = [];
        let job_posts_list = [];
        let profile_promises = [];
        if (res.watcheeUserIds.length > 0) {
            for (let i = 0; i < res.watcheeUserIds.length; i++) {
                profile_promises.push(
                    new Promise((resolve) => {
                        apiCall(`user?userId=${res.watcheeUserIds[i]}`, 'GET', {}).then(data => {
                            followers_list.push(`<li><a class="user-link" data-id="${data.id}">${data.name}</a></li>`);
                        }).then(function() {
                            resolve();
                        });
                    })
                );
            }
        }
        if (res.jobs.length > 0) {
            for (let i = 0; i < res.jobs.length; i++) {
                let buttons = '';
                if (getUserId() == res.jobs[i].creatorId) {
                    buttons = `
                        <button type="button" class="btn btn-xs btn-secondary ms-1 edit-job-post-btn" data-bs-toggle="modal" data-bs-target="#job-post-modal" data-id="${res.jobs[i].id}">Edit</button>
                        <button type="button" class="btn btn-xs btn-danger ms-1 remove-job-post-btn" data-bs-toggle="modal" data-bs-target="#confirm-delete-modal" data-id="${res.jobs[i].id}" data-user_id="${res.jobs[i].creatorId}">Delete</button>
                    `;
                }

                job_posts_list.push(
                    `<li>
                        ${res.jobs[i].title}${buttons}
                    </li>`
                );
            }
        }

        Promise.all(profile_promises).then(function() {
            let followers = 'No followers';
            if (followers_list.length > 0) {
                followers = followers_list.join('');
            }

            let job_posts = 'No job posts';
            if (job_posts_list.length > 0) {
                job_posts = job_posts_list.join('');
            }

            profile_page.insertAdjacentHTML('beforeend', profile_page_info(res.name, res.email, res.image ?? 'https://i.pinimg.com/originals/f1/0f/f7/f10ff70a7155e5ab666bcdd1b45b726d.jpg', num_followers, edit_or_follow_btn, followers, job_posts));
            initialiseProfileListeners();
        });
    });
}

function initialiseJobFeedListeners() {
    let job_likes_links = document.querySelectorAll('#feed-list .like-job-btn');
    let job_user_links = document.querySelectorAll('#feed-list .user-link');
    let job_post_comments = document.querySelectorAll('#feed-list .job-post-comment-btn');
    let job_likes_details = document.querySelectorAll('#feed-list .job-likes');
    let job_feed_view_profile = document.getElementById('view-profile-btn');

    for (let i = 0; i < job_user_links.length; i++) {
        job_user_links[i].addEventListener('click', toProfileButton);
    }

    for (let i = 0; i < job_post_comments.length; i++) {
        job_post_comments[i].addEventListener('click', addCommentButton);
    }

    for (let i = 0; i < job_likes_links.length; i++) {
        job_likes_links[i].addEventListener('click', likeButton);
    }

    for (let i = 0; i < job_likes_details.length; i++) {
        job_likes_details[i].addEventListener('click', likeDetailButton);
    }

    job_feed_view_profile.addEventListener('click', toProfileButton);
}

function initialiseProfileListeners() {
    const follow_button = document.getElementById('user-profile-follow');
    const edit_info_button = document.getElementById('edit-user-info');
    const edit_job_post_btns = document.getElementsByClassName('edit-job-post-btn');
    const remove_job_post_btns = document.getElementsByClassName('remove-job-post-btn');

    if (follow_button != null) {
        follow_button.addEventListener('click', watchOrUnwatch);
    }
    if (edit_info_button != null) {
        edit_info_button.addEventListener('click', changeProfileButton);
    }
    for (let i = 0; i < edit_job_post_btns.length; i++) {
        edit_job_post_btns[i].addEventListener('click', function(e) {
            submit_job_btn.dataset.id = this.dataset.id;
            submit_job_btn.dataset.mode = 'edit';
            submit_job_btn.innerText = 'Save';
            job_modal_header.innerText = 'Edit job post';
        });
    }
    for (let i = 0; i < remove_job_post_btns.length; i++) {
        remove_job_post_btns[i].addEventListener('click', function(e) {
            confirm_delete_btn.dataset.id = this.dataset.id;
            confirm_delete_btn.dataset.user_id = this.dataset.user_id;
        });
    }
}

const toProfileButton = (event) => {
    event.preventDefault();
    let btn = event.currentTarget;

    toProfilePage(btn.dataset.id);

    job_likes_modal.hide();
}

const changeProfileButton = (event) => {
    event.preventDefault();
    resetUserInfoModal();

    let btn = event.currentTarget;
    let id = btn.dataset.id;

    prefillUserInfoModal(id);
}

const changeProfile = (event) => {
    event.preventDefault();

    let id = event.currentTarget.dataset.id;
    let email = user_info_email.value;
    let password = user_info_password.value;
    let confirm_password = user_info_confirm_password.value;
    let name = user_info_name.value;
    let image_url = null;
    if (user_info_image.files.length) {
        try {
            fileToDataUrl(user_info_image.files[0]).catch((error) => {
                alert(error);
                return;
            }).then(function(data) {
                image_url = data;
            });
        } catch(error) {
            alert(error);
            return;
        }
    }

    if (!email.length && !password.length && !confirm_password.length && !name.length && !image_url) {
        alert('You have not made any changes');
        return;
    } else if ((password.length && !confirm_password.length) || (password != confirm_password)) {
        alert('The passwords entered do not match');
        return;
    }

    apiCall(`user?userId=${id}`, 'GET', {}).then(function(data) {
        let payload = {};
        if (email.length && email != data.email) {
            payload = {...payload, ...{email: email}};
        }
        if (password.length) {
            payload = {...payload, ...{password: password}};
        }
        if (name.length && name != data.name) {
            payload = {...payload, ...{name: name}};
        }
        if (image_url) {
            payload = {...payload, ...{image: image_url}};
        }
        if (Object.keys(payload).length > 0) {
            apiCall('user', 'PUT', payload).then(function() {
                alert('User details edited successfully.');
                user_info_modal.hide();
                logout();
            });
        } else {
            alert('You have not made any changes');
            return;
        }
    });
}

const watchOrUnwatch = (event) => {
    event.preventDefault();

    let btn = event.currentTarget;
    let id = btn.dataset.id;
    let mode = btn.dataset.mode;
    let email = btn.dataset.email;

    let payload = {
        email: email,
        turnon: mode === 'watch'
    };

    apiCall('user/watch', 'PUT', payload).then(() => {
        if (mode === 'watch') {
            btn.innerText = 'Unwatch';
        } else {
            btn.innerText = 'Watch';
        }
    });
    toProfilePage(id);
}

const likeButton = (event) => {
    event.preventDefault();

    let btn = event.currentTarget;

    let payload = {
        id: btn.dataset.id,
        turnon: btn.classList.contains('bi-heart')
    };

    apiCall('job/like', 'PUT', payload).then(function() {
        btn.classList.toggle('bi-heart-fill');
        btn.classList.toggle('bi-heart')
        getFeed();
    });
}

const likeDetailButton = (event) => {
    resetJobLikesModal();

    let btn = event.currentTarget;
    let job_post_title = btn.dataset.job_name;
    let user_ids_str = btn.dataset.user_ids;

    let user_ids = user_ids_str.split(',').filter(item => item);

    let like_list = [];
    let like_detail_promises = [];
    for (let i = 0; i < user_ids.length; i++) {
        like_detail_promises.push(
            new Promise((resolve) => {
                apiCall(`user?userId=${user_ids[i]}`, 'GET', {}).then(function(data) {
                    like_list.push(`<li><a class="user-link" href="#user?userId=${data.id}" data-id="${data.id}">${data.name}</a></li>`);
                }).then(function() {
                    resolve();
                });
            })
        )
    }

    Promise.all(like_detail_promises).then(function() {
        job_likes_modal_header_name.innerText = job_post_title;
        if (like_list.length == 0) {
            like_list.push('<li>No likes</li>');
        }
        job_likes_list.insertAdjacentHTML('beforeend', like_list.join(''));
        let job_user_links = document.querySelectorAll('#job-likes-modal .user-link');
        for (let i = 0; i < job_user_links.length; i++) {
            job_user_links[i].addEventListener('click', toProfileButton);
        }
    });
}

const addCommentButton = (event) => {
    event.preventDefault();

    let btn = event.currentTarget;

    let id = btn.dataset.id;

    let comment = btn.parentElement.previousElementSibling.value;
    if (!comment.length) {
        alert('Cannot post an empty comment!');
        return;
    }

    let payload = {
        id: id,
        comment: comment
    };
    apiCall('job/comment', 'POST', payload).then(function() {
        navigateTo('feed');
        setNavbarActive('feed');
        getFeed();
    });
}

const startdate = (date) => {
    const realdate = new Date(date);
    const year = realdate.getUTCFullYear();
    const month = realdate.getUTCMonth() + 1;
    const day = realdate.getUTCDate();
    const res = `${day}/${month}/${year}`;
    return res;
}

const postdate = (time) => {
    const now = Date.now();
    const check = new Date(time);
    const hourdiff = Math.floor((now - check.getTime()) / 1000 / 60 / 60);
    if (hourdiff < 24) {
        const minsdiff = Math.floor((now - check.getTime()) % 3600000 / 60000);
        return `${hourdiff} hr${hourdiff === 1 ? "" : "s"} ${minsdiff} min${minsdiff === 1 ? "" : "s"} ago`
    } else {
        return startdate(time);
    }
}

function setNavbarActive(destination) {
    for (let i = 0; i < navbar_links.length; i++) {
        if (navbar_links[i].dataset.destination === destination) {
            navbar_links[i].classList.add('active');
        } else {
            navbar_links[i].classList.remove('active');
        }
    }
}

function navigateTo(destination) {
    if (!destination in ['feed', 'login', 'profile']) {
        return;
    }
    for (let i = 0; i < pages.length; i++) {
        pages[i].classList.add('hidden');
    }

    if (destination === 'feed') {
        feed_page.classList.remove('hidden');
    } else if (destination === 'login') {
        login_register_page.classList.remove('hidden');
    } else if (destination === 'profile') {
        profile_page.classList.remove('hidden');
    }
    window.location.href = `/#${destination}`;
}

function prefillUserInfoModal(id) {
    if (id != null) {
        apiCall(`user?userId=${id}`, 'GET', {}).then(function(data) {
            user_info_email.value = data.email;
            user_info_name.value = data.name;
            user_info_submit.dataset.id = data.id;
        });
    }
}

function resetJobPostModal() {
    job_modal_header.innerText = 'Create job post';
    submit_job_btn.dataset.id = '';
    submit_job_btn.dataset.mode = 'create';
    submit_job_btn.innerText = 'Create';
    create_job_title.value = null;
    create_job_date.value = null;
    create_job_description.value = null;
    create_job_img.value = null;
}

function resetUserInfoModal() {
    user_info_email.value = null;
    user_info_password.value = null;
    user_info_confirm_password.value = null;
    user_info_name.value = null;
    user_info_image.value = null;
    user_info_submit.dataset.id = '';
}

function resetJobLikesModal() {
    job_likes_modal_header_name.innerText = '';
    job_likes_list.innerHTML = '';
}

const apiCall = (path, method, body) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'Content-type': 'application/json',
            },
        };
        if (method === 'GET') {

        } else {
            options.body = JSON.stringify(body);
        }
        if (localStorage.getItem('token')) {
            options.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
        }
        fetch(`http://localhost:${BACKEND_PORT}/` + path, options)
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                resolve(data);
            }
        });
    });
};

function setToken(token) {
    localStorage.setItem('token', token);
    navbar_login.classList.add('hidden');
    navbar_logout.classList.remove('hidden');
}

function setUserid(userid) {
    localStorage.setItem('userid', userid);
}

function getUserId() {
    return localStorage.getItem('userid') ?? null;
}

function logout() {
    localStorage.removeItem('token');
    navbar_login.classList.remove('hidden');
    navbar_logout.classList.add('hidden');
    navigateTo('login');
    setNavbarActive('login');
}

function open() {
    if (localStorage.getItem('token')) {
        navbar_login.classList.add('hidden');
        navbar_logout.classList.remove('hidden');
        navigateTo('feed');
        setNavbarActive('feed');

        getFeed();
    } else {
        navbar_login.classList.remove('hidden');
        navbar_logout.classList.add('hidden');
        navigateTo('login');
        setNavbarActive('login');
    }
}

open();

// LISTENERS //
navbar_brand.addEventListener('click', function(e) {
    e.preventDefault();
    open();
});

for (let i = 0; i < navbar_links.length; i++) {
    navbar_links[i].addEventListener('click', function(e) {
        let destination = navbar_links[i].dataset.destination;

        // Update active status of navbar links
        setNavbarActive(destination);
        navigateTo(destination);
    });
}

for (let i = 0; i < show_login_elems.length; i++) {
    show_login_elems[i].addEventListener('click', function(e) {
        e.preventDefault();

        login_tab.classList.add('show', 'active');
        register_tab.classList.remove('show', 'active');
        show_login_btn.classList.add('active');
        show_register_btn.classList.remove('active');
    });
}

for (let i = 0; i < show_register_elems.length; i++) {
    show_register_elems[i].addEventListener('click', function(e) {
        e.preventDefault();

        login_tab.classList.remove('show', 'active');
        register_tab.classList.add('show', 'active');
        show_register_btn.classList.add('active');
        show_login_btn.classList.remove('active');
    });
}

for (let i = 0; i < toggle_password_btns.length; i++) {
    toggle_password_btns[i].addEventListener('click', function(e) {
        e.preventDefault();

        let password_input = this.previousElementSibling;
        let type = password_input.getAttribute('type') === 'password' ? 'text' : 'password';
        password_input.setAttribute('type', type);
        this.classList.toggle('bi-eye');
    });
}

navbar_logout.addEventListener('click', function(e) {
    e.preventDefault();

    logout();
});

login_btn.addEventListener('click', function(e) {
    e.preventDefault();

    let payload = {
        email: login_email.value,
        password: login_password.value
    }
    apiCall('auth/login', 'POST', payload).then(function(data) {
        setToken(data.token);
        navigateTo('feed');
        setNavbarActive('feed');
        setUserid(data.userId);
        getFeed();
    });
});

register_btn.addEventListener('click', function(e) {
    e.preventDefault();

    if (!register_name.value.length || !register_email.value.length || !register_password.value.length || !register_confirm_password.value.length) {
        alert('Please fill out every field.');
        return;
    } else if (register_password.value != register_confirm_password.value) {
        alert('Please ensure your passwords match and try again.');
        return;
    }
    let payload = {
        name: register_name.value,
        email: register_email.value,
        password: register_password.value
    };
    apiCall('auth/register', 'POST', payload).then(function(data) {
        setToken(data.token);
        setUserid(data.userId);
        navigateTo('feed');
        setNavbarActive('feed');
        getFeed();
    });
});

submit_job_btn.addEventListener('click', function(e) {
    e.preventDefault();

    let mode = this.dataset.mode;
    if (!mode in ['create', 'edit']) {
        alert('An error occured, please refresh and try again.');
        return;
    }

    let title = create_job_title.value;
    let date_obj = new Date(create_job_date.value);
    let description = create_job_description.value;
    let image_url = null;

    if (isNaN(date_obj)) {
        alert('Invalid date entered');
        return;
    }

    if (!title || !date_obj || !description) {
        alert('Please fill in all the required fields');
        return;
    }

    let file_promise = [];
    if (create_job_img.files.length) {
        file_promise.push(
            new Promise((resolve) => {
                fileToDataUrl(create_job_img.files[0]).catch((error) => {
                    alert(error);
                    return;
                }).then(function(data) {
                    image_url = data;
                    resolve();
                });
            })
        );
    }

    try {
        Promise.all(file_promise).then(function() {
            let payload = {
                title: title,
                start: date_obj.toISOString(),
                description: description,
                image: image_url
            };

            if (mode === 'create') {
                apiCall('job', 'POST', payload).then(function() {
                    alert('Job post successfully created!');
                    job_post_modal_bs.hide();
                    getFeed();
                });
            } else if (mode === 'edit') {
                let id = this.dataset.id;
                apiCall('job', 'PUT', {...payload, ...{id: id}}).then(function() {
                    alert('Job post successfully edited!');
                    job_post_modal_bs.hide();
                    getFeed();
                });
            }
        });
    } catch(error) {
        alert(error);
        return;
    }
});

job_post_modal.addEventListener('hidden.bs.modal', function(e) {
    e.preventDefault();

    resetJobPostModal();
});

confirm_delete_btn.addEventListener('click', function(e) {
    e.preventDefault();

    let id = this.dataset.id;
    let user_id = this.dataset.user_id;
    if (id != null) {
        apiCall('job', 'DELETE', {id: id}).then(function() {
            alert('Job post deleted.')
            confirm_delete_modal.hide();
            if (user_id != null) {
                toProfilePage(user_id);
            } else {
                getFeed();
            }
        });
    }
});

user_info_submit.addEventListener('click', changeProfile);
