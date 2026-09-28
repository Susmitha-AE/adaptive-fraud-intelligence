import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any

REQUIRED_COLUMNS = ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount']

def validate_data(df: pd.DataFrame, is_training: bool = False) -> Tuple[bool, str]:
    """Validates dataframe schema and basic health."""
    reqs = list(REQUIRED_COLUMNS)
    if is_training:
        reqs.append('Class')

    missing_cols = [col for col in reqs if col not in df.columns]
    if missing_cols:
        return False, f"Missing required columns: {missing_cols}"

    return True, "Data validation successful"

def check_data_quality(df: pd.DataFrame) -> Dict[str, Any]:
    """Checks for missing values, duplicates, class imbalance, and basic statistics."""
    missing_count = int(df.isnull().sum().sum())
    duplicate_count = int(df.duplicated().sum())
    total_rows = len(df)

    class_imbalance = {}
    if 'Class' in df.columns:
        class_counts = df['Class'].value_counts().to_dict()
        class_imbalance = {
            'legitimate': int(class_counts.get(0, 0)),
            'fraudulent': int(class_counts.get(1, 0)),
            'fraud_ratio': float(class_counts.get(1, 0) / total_rows if total_rows > 0 else 0)
        }

    return {
        'total_rows': total_rows,
        'missing_values': missing_count,
        'duplicate_rows': duplicate_count,
        'class_imbalance': class_imbalance
    }

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Creates time-derived and amount-derived features for model training and inference."""
    df_feat = df.copy()

    # Fill missing V1..V28 with 0 if missing in inference dict
    for i in range(1, 29):
        col = f'V{i}'
        if col not in df_feat.columns:
            df_feat[col] = 0.0
        else:
            df_feat[col] = df_feat[col].fillna(0.0)

    if 'Time' not in df_feat.columns:
        df_feat['Time'] = 0.0
    else:
        df_feat['Time'] = df_feat['Time'].fillna(0.0)

    if 'Amount' not in df_feat.columns:
        df_feat['Amount'] = 0.0
    else:
        df_feat['Amount'] = df_feat['Amount'].fillna(0.0)

    # Time derived features
    df_feat['hour_of_day'] = (df_feat['Time'] / 3600.0) % 24.0

    # Amount derived features
    df_feat['amount_log'] = np.log1p(np.maximum(0, df_feat['Amount']))

    return df_feat

def prepare_features_and_target(df: pd.DataFrame, is_training: bool = True) -> Tuple[pd.DataFrame, Any]:
    """Prepares feature matrix X and target array y."""
    df_engineered = engineer_features(df)

    feature_cols = [f'V{i}' for i in range(1, 29)] + ['Amount', 'hour_of_day', 'amount_log']

    X = df_engineered[feature_cols]

    if is_training and 'Class' in df.columns:
        y = df_engineered['Class']
        return X, y

    return X, None
