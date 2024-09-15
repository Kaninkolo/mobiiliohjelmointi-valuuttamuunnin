import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState, useEffect } from 'react';

export default function App() {

  const apiKey = process.env.EXPO_PUBLIC_API_KEY;
  
  const [amount, setAmount] = useState('');
  const [symbols, setSymbols] = useState('');
  const [currencies, setCurrencies] = useState([]);
  const [convertedRate, setConvertedRate] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const apiUrl =`https://api.apilayer.com/exchangerates_data/latest?symbols=${symbols}&base=EUR`

  const requestOptions = {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'apikey': apiKey,
    }
  };
  
  useEffect(() => {
    fetch('https://api.apilayer.com/exchangerates_data/symbols', requestOptions)
    .then(response => {
      if (!response.ok)
        throw new Error("Error getting available currencies: " + response.statusText);
//      console.log(response) //katso paljon käyttämättä
      return response.json()
    })
    
    .then(data => {
      const fetchedCurrencies = Object.keys(data.symbols);
      console.log("Fetched currencies", fetchedCurrencies);
      setCurrencies(fetchedCurrencies);
      //console.log("useState currencies", currencies); antoi tyhjää?
    })
    .catch(err => console.error(err));
  }, []);


  
  const handleFetch = () => {
    setLoading(true);
    fetch(apiUrl, requestOptions)
    .then(response => {
      if (!response.ok)
        throw new Error("Error in fetch:" + response.statusText);
        
      return response.json()
    })
    .then(data => setConvertedRate(data.rates[symbols]))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }
  const pickerChange = (itemValue) => {
    setSymbols(itemValue);
    setAmount('');
    setConvertedRate(null);
  }
  
  return (
    <View style={styles.container}>
      <Text>CONVERT CURRENCY TO EUR!</Text>
      <View style={styles.convert}>
        <TextInput 
          placeholder='   amount'
          keyboardType="numeric"
          value={amount}
          onChangeText={text => setAmount(text)}
          style={styles.input}
        />
        {currencies.length > 0 ? (
        <Picker
          selectedValue={symbols}
          onValueChange={pickerChange}
          style={styles.picker} // Pakko antaa koot pickerille tai se ei näy!!
        >
          {currencies.map((currency) => (
            <Picker.Item key={currency} label={currency} value={currency} />
          ))}
        </Picker>
        ) : (
          <Text>Loading currencies...</Text>
        )}
      </View>
      
      <Button title="Convert to EUR" onPress={handleFetch} />
      
      {loading && <ActivityIndicator size="large" />}

      {convertedRate && (
        <Text style={styles.result}>
        {amount} {symbols} = {( amount / convertedRate).toFixed(2)} EUR
        </Text>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: 50,
    height: 40,
  },
  input: {
    width: 80,
    height: 40,
    borderColor: 'black',
    borderWidth: 2,
    marginBottom: 20,
    padding:  5,
    
  },
  picker: {
    width: 150,
    height: 50,
    marginBottom: 20,
  },
  convert: {
    flexDirection: 'row',
    gap: 20,
    
  },
  result: {
    padding: 20
  }
});
