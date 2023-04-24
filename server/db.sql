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
    created_at timestamp with time zone
);

create table comment (
    comment_id serial primary key,
    question_id int references question(question_id) on delete RESTRICT,
    no_likes int 
    
);
