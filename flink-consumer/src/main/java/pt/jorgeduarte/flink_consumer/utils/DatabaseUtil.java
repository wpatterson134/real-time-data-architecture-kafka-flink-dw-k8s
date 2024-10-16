package pt.jorgeduarte.flink_consumer.utils;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import pt.jorgeduarte.flink_consumer.persistent.entities.User;

public class DatabaseUtil {
    private static Connection connection;

    public static void initialize(String dbUrl, String dbUsername, String dbPassword){
        try{
        connection = DriverManager.getConnection(dbUrl, dbUsername, dbPassword);
        } catch (SQLException e) {
            e.printStackTrace();
            // Handle exception appropriately
        }
    }

    public static Connection getConnection() {
        return connection;
    }

    public static void saveUser(User user) throws SQLException {
        String sql = "INSERT INTO users (name, email, phone, street, city, state, zip) VALUES (?, ?, ?, ?, ?, ?, ?)";
        PreparedStatement stmt = connection.prepareStatement(sql);
        stmt.setString(1, user.getName());
        stmt.setString(2, user.getEmail());
        stmt.setString(3, user.getPhone());
        stmt.setString(4, user.getStreet());
        stmt.setString(5, user.getCity());
        stmt.setString(6, user.getState());
        stmt.setString(7, user.getZip());
        stmt.executeUpdate();
    }
}
