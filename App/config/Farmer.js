import React from 'react'
import { View,Text,StyleSheet } from 'react-native'
import {Card} from '../shared/card'


export function Farmer(item) {
  return (
    <Card>
      <Text style={{ padding: 10, fontSize: 14 }}>
        {item.first_name} {item.Surname}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({

})
