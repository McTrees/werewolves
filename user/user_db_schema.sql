BEGIN TRANSACTION;
DROP TABLE IF EXISTS signed_up_users;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS player_tags;
DROP TABLE IF EXISTS global_player;

CREATE TABLE signed_up_users (
    user_id char(21) not null unique,
    emoji varchar(18) not null unique,
    finalised boolean not null default 0
);

CREATE TABLE players (
  user_id char(21) not null unique,
  alive boolean not null default 1,
  role varchar(18) not null,
  foreign key (user_id) references signed_up_users(user_id)
);

CREATE TABLE player_tags (
  user_id char(21) not null,
  tag_name varchar(18) not null,
  foreign key (user_id) references players(user_id)
);

CREATE TABLE global_player (
	user_id char(21) not null unique,
	username varchar(30),
	gender char(1),
	age int(2),
	personal_record TEXT,
	personal_desc TEXT,
	games int(2) default 0,
	wins int(2) default 0,
	profile_pic varchar(255)
);
COMMIT;
