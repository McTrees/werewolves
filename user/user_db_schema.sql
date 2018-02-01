BEGIN TRANSACTION;
DROP TABLE IF EXISTS signed_up_users;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS player_tags;

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
	gender char(1),
	age integer,
	record varchar(80),
	personal_desc varchar(160)
);
COMMIT;
