import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { useFarmers } from "../hooks/useFarmers";
import { useFarmersTemp } from "../hooks/useFarmersTemp";

export default async function openDb() {
  // const database = SQLite.openDatabase("FarmerDB_EA.db");
  // database._db.close();

  if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + "SQLite")).exists) {
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "SQLite");
  }
  
  if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + "SQLite/FarmerDB_EA.db")).exists) {

    await FileSystem.downloadAsync(
      Asset.fromModule(require("../assets/www/FarmerDB_EA.db")).uri,
      FileSystem.documentDirectory + "SQLite/FarmerDB_EA.db"
    );
  }
  return SQLite.openDatabase("FarmerDB_EA.db");
}

export const SearchFarmerByUserId_ExactMatch = async (userId) => {
  
  const {existingFarmersTemp } = await useFarmersTemp()
  const {existingFarmers} = await useFarmers()

  let farmer = []
  let res = null
  if(existingFarmersTemp){
    res = JSON.parse(existingFarmersTemp);
    farmer = res.find((x) => x.farmerID.indexOf(userId) > -1);
  }

  let existingFarmerID = []
  if(existingFarmers){
    const existingFarmerJson = JSON.parse(existingFarmers)
    existingFarmerID = existingFarmerJson.find(x => x.farmerID.indexOf(userId) > -1)
  }

  if ((farmer && farmer.length > 0) || existingFarmerID > 0) {
    return true;
  } else {
    const db = await openDb();

    return new Promise((resolve, reject) => {
      try{
        db.transaction((tx) => {
          tx.executeSql(
            `SELECT * FROM Farmer WHERE farmerID LIKE '${userId}%' LIMIT 10`,
            [],
            async (tx, result) => {
              let response = false;
              var len = result.rows.length;
              if (len > 0) {
                response = true;
              } else {
                response = false;
              }
              resolve(response);
            }
          );
        });
      }
      catch(error){
        console.log("Search error",error);
        reject(error);
      }
    });
  }
};

export const AddFarmerRecord = async (result) => {

  for(let i=0;i<result.length;i++){
    const farmer = result[i];
    
    const queryString = `INSERT OR REPLACE INTO Farmer (id, first_name, Surname, Birth_date, Gender, Contact_number, Date_of_registration, Please_pinpoint_the_tion_is_taking_place, instanceID, project, farmerID, verified_farmerID, verified_date)
    VALUES('${farmer.id}', '${farmer.first_name}', '${farmer.Surname}', '${farmer.Birth_date}', '${farmer.Gender}', '${farmer.Contact_number}', '${farmer.Date_of_registration}','${farmer.Please_pinpoint_the_tion_is_taking_place}','${farmer.instanceID}', '${farmer.project}', '${farmer.farmerID}', '${farmer.verified_farmerID}', '${farmer.verified_date}') 
    ;`;
    
    try{
      const db = await openDb();
          db.transaction((tx) =>
          tx.executeSql(
            queryString,
            [],
            (tx,result) => {
            },
            (tx,error) => {
              
              console.log("Error occured",error);
            },
            (tx, error) => {
              console.log("Error occured in SQLStatementError callback",error);
            }
          ));
    }
    catch(error){
      console.log("Error occured in insert method",error);
      throw error;
    }
  }
  
}