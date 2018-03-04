BEGIN TRANSACTION;
DROP TABLE IF EXISTS secret_channels;

CREATE TABLE secret_channels (
  channel_id char(21) not null,
  tag_name varchar(18) not null
);

COMMIT;
