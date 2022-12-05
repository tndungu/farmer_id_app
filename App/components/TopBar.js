import React from 'react'
import {LinearGradient} from 'expo-linear-gradient'
import { StyleSheet,View } from 'react-native'
import colors from '../config/colors'

export function TopBar(){
  return (
    <LinearGradient
        start={{ x: 0.1, y: 0.2 }}
        colors={[colors.primary, "transparent"]}
        style={styles.linearGradient}
      >
        <View style={styles.topBar}>
        </View>
      </LinearGradient>
  )
}

const styles = StyleSheet.create({
  linearGradient: {
    flex: 0.5,
    flexDirection:'row',
    width:'100%',
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 0,
  },
})
