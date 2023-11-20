import java.io.*;
import java.net.*;

public class PingClient {

	public static void main(String[] args) throws Exception {

		// Define socket parameters, address and Port No
		String serverName = "localhost";
		if (args.length != 1) {
         System.out.println("Required arguments: port");
         return;
      	}
      	int port = Integer.parseInt(args[0]);
		
		// create socket which connects to server
		Socket clientSocket = new Socket(serverName, serverPort);       
		// get ping massage
		String sentence = 'PING';

		// write to server
		DataOutputStream outToServer = new DataOutputStream(clientSocket.getOutputStream());
		outToServer.writeBytes(sentence + '\n');

		// create read stream and receive from server
		BufferedReader inFromServer = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
		String sentenceFromServer;
		sentenceFromServer = inFromServer.readLine();

		// print output
		System.out.println("From Server: " + sentenceFromServer);

		// close client socket
		clientSocket.close();

	} // end of main

} // end of PingClient
