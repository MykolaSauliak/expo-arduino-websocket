import * as React from 'react';
import { StyleSheet , TextInput,  FlatList, Dimensions, ScrollView } from 'react-native';
import { ListItem, Button } from 'react-native-elements';

import { Text, View } from '../components/Themed';
import {  LineChart } from "react-native-chart-kit";
import moment from 'moment'

const screenWidth = Dimensions.get('window').width

const chartConfig = {
  backgroundGradientFrom: '#1E2923',
  backgroundGradientTo: '#08130D',
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  propsForVerticalLabels: {
    paddingTop: 25,
  },
}

const NUMBER_OF_DATA_TO_SHOW_ON_CHART = 15
const NUMBER_OF_DATA_TO_SHOW_IN_THE_LIST  = 50

// set static IP for nodemcu 
export default function TabOneScreen() {

  const [ws, setWs] = React.useState(null);
  const [sensorData, setSensorData] = React.useState([])
  const [chartData, setChartData] = React.useState({labels: [], datasets: [{data: []}]})
  const [newData, setNewData] = React.useState(null)
  const [showChart, setShowChart] = React.useState(false)


  React.useEffect(() => {
    if(newData){
      setSensorData([newData, ...sensorData].slice(0,NUMBER_OF_DATA_TO_SHOW_IN_THE_LIST))
      const newChartData = {
        labels : [ moment(newData.date).format('LTS'), ...chartData.labels,].slice(0,NUMBER_OF_DATA_TO_SHOW_ON_CHART),
        datasets: [{data: [newData.value, ...chartData.datasets[0].data, ].slice(0,NUMBER_OF_DATA_TO_SHOW_ON_CHART)}]
      }
      setChartData(newChartData)
      setNewData(null)
    }
  }, [newData])

  const _addData = (e) => {
    if(e.data && Number(e.data)){
      const newData = {
        date: new Date().toISOString(),
        value: e.data
      }
      setNewData(newData)
    }
  }


  const _toggleWebsocket = () => {
    if(!!ws){
      try{
        ws?.close()
        setWs(null)
      }catch(err){
        console.log('err',err)
      }
    }   
    else{
      const ws = new WebSocket('ws://192.168.0.150/ws');
      ws.onopen = () => {  // connection opened  ws.send('something'); // send a message
        console.log('open')
        try{
          ws.send('hi')
        }catch(err){

        }

        setWs(ws)
      };
      ws.onmessage = _addData;
      ws.onerror = (e) => {  // an error occurred  console.log(e.message);

      };
      ws.onclose = (e) => {  // connection closed  console.log(e.code, e.reason);
        setWs(null)
      };
    }
  }

  const _toggleChart = () => setShowChart(!showChart)

  return (
    <View style={styles.container}>
      <Text style={styles.connectionTilte}>{!!ws ? 'Connected' : "Not connected" }</Text>
      <View style={{flexDirection: 'row', justifyContent:'space-around'}}>
        <Button title="Toggle connection" containerStyle={styles.btnContainer} onPress={_toggleWebsocket}/>
        <Button title="Clear data" containerStyle={styles.btnContainer} onPress={() => setSensorData([])}/>
      </View>
      <Button title={showChart ? "Show chart" : 'Hide chart' } containerStyle={styles.btnContainer} onPress={_toggleChart}/>
      {showChart && (
        <LineChart
          data={chartData}
          verticalLabelRotation={290}
          
          width={screenWidth}
          height={350}
          chartConfig={chartConfig}
        />
      )}
      {(!showChart && <FlatList 
        data={sensorData}
        keyExtractor={(item, index) =>index}
        renderItem={({ item, index, separators }) => (
          <ListItem>
              <Text>{index}</Text>
              <Text>{item.date}</Text>
              <Text>{item.value}</Text>
          </ListItem>
        )
          }
        />)}
    </View>
  );
}

const styles = StyleSheet.create({
  connectionTilte: {
    marginVertical: 15,
    fontSize: 25,
    fontWeight: 'bold'
  },
  btnContainer:{
    margin: 3
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
