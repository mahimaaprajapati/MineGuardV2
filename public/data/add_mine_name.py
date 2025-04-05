import pandas as pd
import os

# Define paths (adjust if needed)
base_path = "C:/Users/Dell/MineGuardV2/mineguard_backend/"
preprocessed_file = os.path.join(base_path, "preprocessed_data1.csv")
mine_locations_file = os.path.join(base_path, "mine_locations.csv")
output_file = os.path.join(base_path, "preprocessed_data_with_names.csv")

# Load both datasets
df = pd.read_csv(preprocessed_file)
mine_df = pd.read_csv(mine_locations_file)

# Optional: round latitude and longitude for matching precision
df["latitude"] = df["latitude"].round(5)
df["longitude"] = df["longitude"].round(5)
mine_df["latitude"] = mine_df["latitude"].round(5)
mine_df["longitude"] = mine_df["longitude"].round(5)

# Merge datasets based on latitude and longitude
merged_df = pd.merge(df, mine_df, on=["latitude", "longitude"], how="left")

# Reorder columns to place mine_name first (optional)
cols = ['mine_name'] + [col for col in merged_df.columns if col != 'mine_name']
merged_df = merged_df[cols]


merged_df.to_csv(output_file, index=False)

print(f" Done! New file saved as: {output_file}")
