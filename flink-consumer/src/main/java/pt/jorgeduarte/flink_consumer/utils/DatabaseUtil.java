package pt.jorgeduarte.flink_consumer.utils;

import java.sql.*;

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
        PreparedStatement addressStmt = null;
        ResultSet addressRs = null;
        PreparedStatement userStmt = null;
        ResultSet userRs = null;
        PreparedStatement userAddressStmt = null;

        try {
            String addressSql = "INSERT INTO D_Address (street, city, state, zip) VALUES (?, ?, ?, ?)";
            addressStmt = connection.prepareStatement(addressSql, new String[] {"id"});
            addressStmt.setString(1, user.getAddress().getStreet());
            addressStmt.setString(2, user.getAddress().getCity());
            addressStmt.setString(3, user.getAddress().getState());
            addressStmt.setString(4, user.getAddress().getZip());
            addressStmt.executeUpdate();

            addressRs = addressStmt.getGeneratedKeys();
            long addressId = 0;
            if (addressRs.next()) {
                addressId = addressRs.getLong(1);
            }

            String userSql = "INSERT INTO D_User (name, email, phone) VALUES (?, ?, ?)";
            userStmt = connection.prepareStatement(userSql, new String[] {"id"});
            userStmt.setString(1, user.getName());
            userStmt.setString(2, user.getEmail());
            userStmt.setString(3, user.getPhone());
            userStmt.executeUpdate();

            userRs = userStmt.getGeneratedKeys();
            long userId = 0;
            if (userRs.next()) {
                userId = userRs.getLong(1);
            }

            String userAddressSql = "INSERT INTO F_UserAddress (user_id, address_id, start_date) VALUES (?, ?, CURRENT_TIMESTAMP)";
            userAddressStmt = connection.prepareStatement(userAddressSql);
            userAddressStmt.setLong(1, userId);
            userAddressStmt.setLong(2, addressId);
            userAddressStmt.executeUpdate();

        } finally {
            if (addressRs != null) addressRs.close();
            if (addressStmt != null) addressStmt.close();
            if (userRs != null) userRs.close();
            if (userStmt != null) userStmt.close();
            if (userAddressStmt != null) userAddressStmt.close();
        }
    }



}
