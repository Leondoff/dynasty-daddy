CREATE USER docker;

CREATE DATABASE docker;

GRANT ALL PRIVILEGES ON DATABASE docker TO docker;

-- create player values table
create table player_values (
    id serial not null,
    name_id varchar(30),
    sf_position_rank int,
    position_rank int,
    sf_trade_value int,
    trade_value int,
    fc_sf_trade_value int,
    fc_trade_value int,
    fc_sf_position_rank int,
    fc_position_rank int,
    dp_sf_trade_value int,
    dp_trade_value int,
    dp_sf_position_rank int,
    dp_position_rank int,
    ds_sf_trade_value int,
    ds_trade_value int,
    ds_sf_position_rank int,
    ds_position_rank int,
    created_at timestamp not null default CURRENT_TIMESTAMP
);

create unique index player_values_id_uindex on player_values (id);

alter table
    player_values
add
    constraint player_values_pk primary key (id);

-- create player info table for player details
create table player_info (
    id serial primary key not null,
    name_id varchar(30) not null unique,
    full_name varchar(50),
    first_name varchar(30),
    last_name varchar(30),
    team varchar(3),
    position varchar(2),
    age int,
    experience int,
    college varchar(50),
    injury_status varchar(25),
    weight int,
    height varchar(8),
    jersey_number int,
    active boolean,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

create unique index player_info_id_uindex on player_info (name_id);

-- create player ids table
create table player_ids (
    id serial primary key not null,
    name_id varchar(30) not null unique,
    sleeper_id varchar(30),
    mfl_id varchar(10),
    ff_id varchar(10),
    espn_id varchar(10),
    yahoo_id varchar(10),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

create unique index player_ids_id_uindex on player_ids (id);

-- create config table
create table config (
    config_key text not null primary key,
    config_value text not null,
    description text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- add active default values
ALTER TABLE
    player_info
ALTER COLUMN
    active
SET
    DEFAULT true;

-- create player ADP table
CREATE TABLE player_adp (
    name_id varchar(30) UNIQUE,
    fantasyPro_adp int,
    bb10_adp int,
    rtsports_adp int,
    underdog_adp int,
    drafters_adp int,
    avg_adp decimal,
    updated_at timestamp not null default CURRENT_TIMESTAMP,
    created_at timestamp not null default CURRENT_TIMESTAMP
);

-- create updated_at trigger
CREATE
OR REPLACE FUNCTION trigger_get_current_timestamp () RETURNS trigger AS $ $ BEGIN NEW.updated_at = NOW();

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

-- create player metadata table
create table player_metadata (
    name_id varchar(30) primary key not null unique,
    profile_json jsonb,
    contract_json jsonb,
    ras_json jsonb,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

create unique index player_metadata_id_uindex on player_metadata (name_id);

-- add trigger to player metadata table
CREATE TRIGGER player_metadata_updated_at BEFORE
UPDATE
    ON player_metadata FOR EACH ROW EXECUTE PROCEDURE trigger_get_current_timestamp();

-- add trigger to player adp table
CREATE TRIGGER player_adp_updated_at BEFORE
UPDATE
    ON player_adp FOR EACH ROW EXECUTE PROCEDURE trigger_get_current_timestamp();

-- add trigger to player ids table
CREATE TRIGGER player_ids_updated_at BEFORE
UPDATE
    ON player_ids FOR EACH ROW EXECUTE PROCEDURE trigger_get_current_timestamp();

-- add trigger to player info table
CREATE TRIGGER player_info_updated_at BEFORE
UPDATE
    ON player_info FOR EACH ROW EXECUTE PROCEDURE trigger_get_current_timestamp();
