create database feedback;

create table feedback (
    id int primary key auto_increment,
    decription varchar(255) not null
);

insert into feedback  (description) values ('My test feedback');
insert into feedback (description) values ('My another test feedback');
