# Deep Learning for Multispectral LULC Analysis

## 1. Project Overview

This project performs land use and land cover (LULC) classification for a region in Sri Lanka using Landsat 8 & 9 imagery (2024).

The workflow combines:

- Google Earth Engine (GEE) for data preprocessing and sample creation
- Python (Keras + TensorFlow) for deep learning-based classification

The final output is a trained 1D Convolutional Neural Network (Conv1D) model that predicts land cover classes from pixel-based spectral features.

## **2. Technologies Used**

![Deep Learning](https://img.shields.io/badge/Deep_Learning-FF6F61?style=for-the-badge&logo=keras&logoColor=white)
![Google Earth Engine](https://img.shields.io/badge/Google_Earth_Engine-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

## **3. Folder Structure**

📂 data

📂 results

📄 README.md

📄 DL_project.ipynb

📄 gee_scripts.js

-  **data:** includes data for project.
-  **results:** includes all result images.
-  **DL_project.ipynb:** includes code for project
-  **gee_scripts.js:** includes code for google earth engine

## **4. Workflow**

![Project Workflow](https://github.com/UpekshaIndeewari/Deep-Learning-for-Multispectral-LULC-Analysis/blob/main/data/workflow.png)

### **5. Study area and data set**

The study area is located in the center of the Sri Lanka specially in hill countryside. The area includes diverse land cover types such as urban, agricultural, forest, water, and barren lands.

### **6. Data Sources:**

**Satellite Imagery:** Landsat 8/9 composite (2024)

**Samples:** Manually collected CSV file (Samples_LC_2024.csv) with 9 classes × 20 samples per class

## **7. Methodology**

**Data Preparation**

- Landsat bands were stacked using rasterio in Google Colab.

- Spectral indices such as NDVI, NDWI, NDBI, NBR, NDMI, NDBaI, and EVI were computed in Google Earth Engine before exporting to the composite image.

- The Digital Elevation Model (DEM) was added as an additional layer.

- Sample points were collected for 9 classes and stored in a CSV file with “sample” and “classvalue” columns.

![Landsat Image](https://github.com/UpekshaIndeewari/Deep-Learning-for-Multispectral-LULC-Analysis/blob/main/data/Landsat_image.png)

**Data Splitting**

Samples were split into training (80%) and testing (20%) sets using the “sample” column.

**Feature Scaling** 

All features were standardized using StandardScaler to improve model convergence and consistency between sample data and image data.

**Model Design (Conv1D CNN)** 

A one-dimensional convolutional neural network was implemented using the Keras Sequential API:

**Model Training**

The model was trained on 14-dimensional input data. The loss and accuracy for both training and validation datasets were monitored over epochs. The training history was plotted to visualize convergence trends.

## **8. Results**

**Accuracy**
Metric	Value
Final Training Accuracy	0.470
Final Validation Accuracy	0.424
Test Accuracy (Evaluate)	0.373
Test Loss	1.5037
| Metric| Value | 
|-------------|--------------|
| Final Training Accuracy     | 0.62 | 
| Final Validation Accuracy     | 0.525 | 
| Test Accuracy (Evaluate)      | 0.542 | 
| Test Loss     | 1.267 | 

These values indicate that the model achieved modest classification performance and struggled to generalize beyond the training data.

**Confusion Matrix**

A normalized confusion matrix was generated using the test dataset.
Diagonal values represented correctly classified pixels, while off-diagonal elements showed confusion between spectrally similar classes (e.g., vegetation vs. cropland).

![Confusion Matrix](https://github.com/UpekshaIndeewari/Deep-Learning-for-Multispectral-LULC-Analysis/blob/main/Results/confusiin_martix.png)

**Classification Map**

The trained model was applied to the entire Landsat image by reshaping pixel data into (height × width, features) format. Each pixel was predicted using the CNN and reshaped back to the original spatial dimensions.

The final classified raster displayed spatial distribution of each land cover class, though visual inspection suggested some class overlap due to low model accuracy.

![Confusion Matrix](https://github.com/UpekshaIndeewari/Deep-Learning-for-Multispectral-LULC-Analysis/blob/main/Results/LanduseMAp_2024.png)

## **9. Discussion**

The low accuracy can be attributed to several factors:

- Insufficient sample size: Only 20 samples per class is too few to capture spectral variability.
- Spectral similarity: Some classes (e.g., vegetation types) overlap in reflectance.
- Model complexity: The CNN had too many parameters relative to available data, causing underfitting.
- Label or coordinate misalignment: Inconsistent pixel sampling can degrade learning.

To improve performance, the following are recommended:

- Increase the number of samples per class to at least 100–200.
- Incorporate additional indices (e.g., SAVI, BSI) and texture features.
- Simplify or regularize the model further.
- Compare results with Random Forest or XGBoost, which perform better on small tabular datasets.
- Apply data augmentation or feature selection to enhance generalization.

## **10. Conclusion**

This project successfully demonstrated a reproducible workflow for land use and land cover classification using Landsat imagery and deep learning in Google Colab.
Although model performance was modest (≈62% accuracy), the pipeline — from image preprocessing to classification map generation — was fully functional.
Future improvements in data quantity and feature engineering are expected to significantly enhance accuracy and model reliability.

## Thank You!
Thank you for taking the time to explore this project.

Happy coding! 🚀



