DROP TABLE IF EXISTS signed_up_users;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS player_tags;

CREATE TABLE signed_up_users (
    user_id char(21) not null unique,
    emoji char(10) not null unique
);

CREATE TABLE players (
  user_id char(21) not null unique,
  alive boolean not null,
  role char(18) not null
)

CREATE TABLE player_tags (
  user_id char(21) not null,
  tag_name char(18) not null
)
