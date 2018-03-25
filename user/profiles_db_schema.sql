BEGIN TRANSACTION;
DROP TABLE IF EXISTS global_player;

CREATE TABLE global_player (
	user_id char(21) not null unique,
	gender varchar(10),
	age int(2),
	personal_record TEXT,
	personal_desc TEXT,
	games int(2) default 0,
	wins int(2) default 0
);
COMMIT;
