-- exported files of data insert calls with reset primary key
COPY player_ids FROM '/data/player_ids.csv' DELIMITER ',' CSV;
SELECT SETVAL('player_ids_id_seq', (SELECT MAX(id) + 1 FROM player_ids));

COPY player_info FROM '/data/player_info.csv' DELIMITER ',' CSV;
SELECT SETVAL('player_info_id_seq', (SELECT MAX(id) + 1 FROM player_info));

COPY player_values FROM '/data/player_values.csv' DELIMITER ',' CSV;
SELECT SETVAL('player_values_id_seq', (SELECT MAX(id) + 1 FROM player_values));

-- insert config options into table with defaults
INSERT INTO config (config_key, config_value, description, created_at, updated_at) VALUES ('show_home_dialog', 'false', 'Boolean - if true display the home page dialog', '2022-06-22 12:26:12.376665 +00:00', '2022-06-22 12:26:12.376665 +00:00');
INSERT INTO config (config_key, config_value, description, created_at, updated_at) VALUES ('home_dialog_header', 'Upcoming release on 6/30/22', 'Header text for the dialog', '2022-06-22 12:26:12.376665 +00:00', '2022-06-22 12:26:12.376665 +00:00');
INSERT INTO config (config_key, config_value, description, created_at, updated_at) VALUES ('home_dialog_body', 'An upcoming release will occur on 6/20/22. There may be a few minutes of downtime. For more information about the release check out the discord.', 'Body text for the Home Dialog', '2022-06-22 12:26:12.376665 +00:00', '2022-06-22 12:26:12.376665 +00:00');
INSERT INTO config (config_key, config_value, description, created_at, updated_at) VALUES ('home_dialog_bg_color', '#a8882b', 'Background color for the modal', DEFAULT, DEFAULT)
INSERT INTO config (config_key, config_value, description, created_at, updated_at) VALUES ('demo_league_id', '815332006815723520', 'League Id for the demo button to load (using older league ids can cause longer loading and unexpected outcomes)', DEFAULT, DEFAULT)
INSERT INTO config (config_key, config_value, description, created_at, updated_at) VALUES ('allow_mfl_login', 'false', 'Boolean - feature flag to hid or show mfl login', DEFAULT, DEFAULT)
INSERT INTO config (config_key, config_value, description, created_at, updated_at) VALUES ('allow_ff_login', 'false', 'Boolean - feature flag to hid or show fleaflicker login', DEFAULT, DEFAULT)
INSERT INTO config (config_key, config_value, description, created_at, updated_at) VALUES ('enable_wrapped', 'false', 'Boolean - feature flag to enable wrapped buttons', DEFAULT, DEFAULT)
INSERT INTO config (config_key, config_value, description, created_at, updated_at) VALUES ('show_header_info', 'false', 'Boolean - if true display header info bar', DEFAULT, DEFAULT)
INSERT INTO config (config_key, config_value, description, created_at, updated_at) VALUES ('header_info_text', '', 'String - header text for the info bar', DEFAULT, DEFAULT)
INSERT INTO config (config_key, config_value, description, created_at, updated_at) VALUES ('header_info_url', '', 'String - URL for content', DEFAULT, DEFAULT)
INSERT INTO config (config_key, config_value, description, created_at, updated_at) VALUES ('allow_espn_login', 'false', 'Boolean - Enable FleaFlicker league login on homepage', DEFAULT, DEFAULT)
