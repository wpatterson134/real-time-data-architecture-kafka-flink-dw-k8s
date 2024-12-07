# run on the windows terminal
docker exec -it oracle-db bash
sqlplus sys/123456 as sysdba


# create the new user, or enter the credentials for the new user
CREATE USER jorgermduarte IDENTIFIED BY 123456;
GRANT CONNECT, RESOURCE TO jorgermduarte;
GRANT UNLIMITED TABLESPACE TO jorgermduarte;

CREATE OR REPLACE DIRECTORY db_backup_dir AS '/opt/oracle/oradata/db_backup';
GRANT READ, WRITE ON DIRECTORY db_backup_dir TO jorgermduarte;

CREATE USER backup_user IDENTIFIED BY 123456;
GRANT CONNECT, RESOURCE TO backup_user;
GRANT UNLIMITED TABLESPACE TO backup_user;

# move the backup fiels to the correct dir on ./data/oracle-data/db_backup
impdp backup_user/123456@localhost:1521/XE DIRECTORY=db_backup_dir DUMPFILE=backup_%U.dmp LOGFILE=import_db.log REMAP_SCHEMA=JORGERMDUARTE:BACKUP_USER REMAP_TABLESPACE=USERS:SYSTEM

