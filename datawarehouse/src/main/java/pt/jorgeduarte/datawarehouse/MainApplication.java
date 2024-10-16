package pt.jorgeduarte.datawarehouse;

import liquibase.Contexts;
import liquibase.Liquibase;
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.springframework.jdbc.core.JdbcTemplate;

import java.sql.Connection;
import java.sql.SQLException;

public class MainApplication {

    public static void main(String[] args) {
        DatabaseConfig databaseConfig = new DatabaseConfig();
        JdbcTemplate jdbcTemplate = databaseConfig.getJdbcTemplate();

        try (Connection connection = jdbcTemplate.getDataSource().getConnection()) {
            Database database = DatabaseFactory.getInstance()
                    .findCorrectDatabaseImplementation(new JdbcConnection(connection));

            Liquibase liquibase = new Liquibase("db/changelog/master.yml", new ClassLoaderResourceAccessor(), database);
            liquibase.update(new Contexts());

            System.out.println("Migrations completed.");
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
