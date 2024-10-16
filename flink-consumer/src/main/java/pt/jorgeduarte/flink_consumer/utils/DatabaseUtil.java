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
        // Inserir os dados do endereço na tabela D_Address
        String addressSql = "INSERT INTO D_Address (street, city, state, zip) VALUES (?, ?, ?, ?)";
        PreparedStatement addressStmt = connection.prepareStatement(addressSql, new String[] {"id"});
        addressStmt.setString(1, user.getAddress().getStreet());
        addressStmt.setString(2, user.getAddress().getCity());
        addressStmt.setString(3, user.getAddress().getState());
        addressStmt.setString(4, user.getAddress().getZip());
        addressStmt.executeUpdate();

        // Obter o ID gerado para o endereço
        ResultSet addressRs = addressStmt.getGeneratedKeys();
        long addressId = 0;
        if (addressRs.next()) {
            addressId = addressRs.getLong(1); // Certifique-se de que o campo ID é numérico no banco de dados
            System.out.println("Generated Address ID: " + addressId);
        } else {
            throw new SQLException("Falha ao obter o ID gerado para o endereço.");
        }

        // Inserir os dados do utilizador na tabela D_User
        String userSql = "INSERT INTO D_User (name, email, phone) VALUES (?, ?, ?)";
        PreparedStatement userStmt = connection.prepareStatement(userSql, new String[] {"id"});
        userStmt.setString(1, user.getName());
        userStmt.setString(2, user.getEmail());
        userStmt.setString(3, user.getPhone());
        userStmt.executeUpdate();

        // Obter o ID gerado para o utilizador
        ResultSet userRs = userStmt.getGeneratedKeys();
        long userId = 0;
        if (userRs.next()) {
            userId = userRs.getLong(1); // Certifique-se de que o campo ID é numérico no banco de dados
            System.out.println("Generated User ID: " + userId);
        } else {
            throw new SQLException("Falha ao obter o ID gerado para o utilizador.");
        }

        // Inserir a relação entre o utilizador e o endereço na tabela F_UserAddress
        String userAddressSql = "INSERT INTO F_UserAddress (user_id, address_id, start_date) VALUES (?, ?, CURRENT_TIMESTAMP)";
        PreparedStatement userAddressStmt = connection.prepareStatement(userAddressSql);
        userAddressStmt.setLong(1, userId);
        userAddressStmt.setLong(2, addressId);
        userAddressStmt.executeUpdate();

        System.out.println("Relação entre User e Address inserida com sucesso.");
    }


}
