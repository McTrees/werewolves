BEGIN TRANSACTION;
DROP TABLE IF EXISTS player_tags;
DROP TABLE IF EXISTS love;
DROP TABLE IF EXISTS win_teams;
DROP TABLE IF EXISTS ability_timings;

CREATE TABLE player_tags (
  user_id char(21) not null,
  tag_name varchar(18) not null
);

CREATE TABLE love (
  lover_id char(21) not null,
  affected_id char(21) not null
);

CREATE TABLE ability_timings (
  user_id char(21) not null,
  ability_name char(21) not null,
  next_time_can_use integer not null
);
COMMIT;
