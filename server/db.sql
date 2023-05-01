drop database if exists studyhub;

create database studyhub;

use studyhub

create table users (
    user_id serial primary key,
    name varchar(255) not null,
    email varchar(255) not null,
    pwdhash varchar(255) not null

);

create table question (
    question_id serial primary key,
    user_id int REFERENCES users(user_id) on delete RESTRICT,
    questions varchar(255) not null,
    created_at timestamp with time zone default CURRENT_TIMESTAMP not null
);

create table comments (
    comment_id serial primary key,
    question_id int references question(question_id) on delete RESTRICT,
    comment varchar(255) not null,
    no_likes int 
    
);

create table feedbacks (
    feedback_id serial primary key,
    user_id int REFERENCES users(user_id) on delete RESTRICT,
    msg varchar(255) not null
    );

ALTER TABLE users ADD auth_id uuid;

ALTER TABLE comments
	ADD COLUMN user_id int REFERENCES users(user_id),
	ADD COLUMN created_at timestamp with time zone default CURRENT_TIMESTAMP not null;