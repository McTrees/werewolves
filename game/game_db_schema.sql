BEGIN TRANSACTION;
DROP TABLE IF EXISTS player_tags;
DROP TABLE IF EXISTS love;
DROP TABLE IF EXISTS win_teams;

CREATE TABLE player_tags (
  user_id char(21) not null,
  tag_name varchar(18) not null
);

CREATE TABLE love (
  lover_id char(21) not null,
  affected_id char(21) not null
);

CREATE TABLE win_teams (
  user_id char(21) not null,
  team varchar(18) not null
);
COMMIT;
