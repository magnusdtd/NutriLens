import pandas as pd
from datasets import Dataset

def main():
    df = pd.read_csv(
        '../usda_branded_food.csv', 
        low_memory=False, 
        dtype={'FOOD_RECORD_ID': str}
    )

    dataset = Dataset.from_pandas(df)

    dataset.push_to_hub("usda_branded_food_data")

if __name__ == "__main__":
    main()