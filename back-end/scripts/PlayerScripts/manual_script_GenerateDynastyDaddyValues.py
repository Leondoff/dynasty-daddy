from sklearn.feature_extraction import FeatureHasher
from DatabaseConnService import GetDatabaseConn
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder, MinMaxScaler, OneHotEncoder

# WIP
def FormatTradesForProcessing(trades):
    mapped_data = []

    for item in trades:
        sideA = item[1]  # Extract the second element
        sideB = item[2]  # Extract the third element

        mapped_item = {'sideA': sideA, 'sideB': sideB}
        mapped_data.append(mapped_item)
    return mapped_data

def GetTrades():
    cursor = GetDatabaseConn(True)

    cursor.execute('select * from trades LIMIT 50000;')
    trades = cursor.fetchall()

    print(trades[0])

    return FormatTradesForProcessing(trades)


# Sample data (replace with your actual data)
trades = GetTrades()

# Flatten the data to create a list of unique player IDs
player_ids = list(set(id for trade in trades for side in ['sideA', 'sideB'] for id in trade[side]))

# Initialize a dictionary to store trade values for each player
player_trade_values = {player_id: 0 for player_id in player_ids}

# Calculate trade values based on the assumption that side A = side B
for trade in trades:
    for side in ['sideA', 'sideB']:
        for player_id in trade[side]:
            player_trade_values[player_id] += 1

# Create feature matrix (X) and target vector (y)
X = np.array(player_ids).reshape(-1, 1)
y = np.array([player_trade_values[player_id] for player_id in player_ids])

# Encode the player IDs to numerical values
label_encoder = LabelEncoder()
X_encoded = label_encoder.fit_transform(X.ravel())

# Scale the target values (trade values) to the range [0, 9999]
scaler = MinMaxScaler(feature_range=(0, 9999))
y = scaler.fit_transform(y.reshape(-1, 1))

# Train a linear regression model
model = LinearRegression()
model.fit(X_encoded.reshape(-1, 1), y)

# Encode the player IDs to numerical values for prediction
X_predict_encoded = label_encoder.transform(player_ids)

# Predict trade values using the trained model
predicted_values_encoded = model.predict(X_predict_encoded.reshape(-1, 1))

# Decode the predicted values to original player IDs
predicted_values_decoded = label_encoder.inverse_transform(X_predict_encoded)

# Combine player IDs and predicted values into a list of tuples
results = list(zip(player_ids, predicted_values_decoded, predicted_values_encoded))

# Sort the results by predicted value in descending order
sorted_results = sorted(results, key=lambda x: x[2], reverse=True)

# Print the sorted results
for player_id, decoded_value, predicted_value in sorted_results[:25]:
    print(f"{decoded_value}: {int(predicted_value):.0f}")
