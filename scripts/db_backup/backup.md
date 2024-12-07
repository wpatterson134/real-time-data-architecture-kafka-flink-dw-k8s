# run on the windows terminal
docker exec -it oracle-db bash
sqlplus sys/123456@localhost:1521/jorgermduarte as sysdba

# granting permissions
CREATE OR REPLACE DIRECTORY db_backup_dir AS '/opt/oracle/oradata/db_backup';
GRANT READ, WRITE ON DIRECTORY db_backup_dir TO jorgermduarte;
GRANT EXP_FULL_DATABASE TO jorgermduarte;
GRANT DATAPUMP_EXP_FULL_DATABASE TO jorgermduarte;

# Now exit the oracle shell and create the directory
mkdir -p /opt/oracle/oradata/db_backup

# export db
expdp jorgermduarte/123456@localhost:1521/jorgermduarte DIRECTORY=db_backup_dir DUMPFILE=backup_%U.dmp LOGFILE=db_backup.log FULL=Y FILESIZE=1G

# copy the backup to the desired folder. The backup is located at the data folder: .\data\oracle-data\db_backup
impdp backup_user/123456@localhost:1521/XE DIRECTORY=db_backup_dir DUMPFILE=backup_%U.dmp LOGFILE=import_db.log REMAP_SCHEMA=old_user:backup_user
