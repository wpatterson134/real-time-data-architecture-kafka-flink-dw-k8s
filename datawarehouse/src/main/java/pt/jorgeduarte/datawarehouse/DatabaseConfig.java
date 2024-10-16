package pt.jorgeduarte.datawarehouse;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

public class DatabaseConfig {

    public JdbcTemplate getJdbcTemplate() {
        String dbUrl = System.getenv("DB_URL");
        String dbUsername = System.getenv("DB_USERNAME");
        String dbPassword = System.getenv("DB_PASSWORD");

        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setUrl(dbUrl);
        dataSource.setUsername(dbUsername);
        dataSource.setPassword(dbPassword);
        dataSource.setDriverClassName("oracle.jdbc.OracleDriver");

        return new JdbcTemplate(dataSource);
    }
}
