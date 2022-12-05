import React from 'react'
import {StyleSheet, View } from 'react-native'

export function Card(props){
    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                {props.children}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card:{
        flex:1,
        width:'80%',
        borderRadius:6,
        elevation:3,
        backgroundColor: '#fff',
        shadowOffset:{width:1,height:1},
        shadowColor:'#333',
        shadowOpacity:0.3,
        shadowRadius:2,
        marginHorizontal:4,
        marginVertical:6,
    },
    cardContent:{
        margin: 10,
    }
})