import numpy as np
import open3d as o3d
from typing import List


class PointCloudGenerator:
    """
    Generates point clouds from RGB images and depth maps, and calculates volumes
    from segmented regions.
    """
    def __init__(
        self, 
        focal_length_x = 470.4, 
        focal_length_y = 470.4
    ):
        self.focal_length_x = focal_length_x
        self.focal_length_y = focal_length_y
    
    def calculate_volumes_from_masks(
        self, 
        width: float, 
        height: float,
        depth_map: np.ndarray, 
        masks: np.ndarray
    ) -> List[float]:
        """
        Calculate volumes for multiple segmentation masks.
        """    
        # Generate mesh grid and calculate point cloud coordinates
        x, y = np.meshgrid(np.arange(width), np.arange(height))
        x = (x - width / 2) / self.focal_length_x
        y = (y - height / 2) / self.focal_length_y
        z = depth_map
        points = np.stack((np.multiply(x, z), np.multiply(y, z), z), axis=-1).reshape(-1, 3)

        volumes = []
        for mask in masks:
            mask_flat = (mask.flatten() == 1) # Apply mask to get segmented points
            filtered_points = points[mask_flat] # Filter points
            volume = 0.0
            if len(filtered_points) < 4:  # Need at least 4 points for meaningful volume calculation
                volume =  0.0
            
            # Create point cloud object
            pcd = o3d.geometry.PointCloud()
            pcd.points = o3d.utility.Vector3dVector(filtered_points)
            hull, _ = pcd.compute_convex_hull() # Compute convex hull
            volume = hull.get_volume() # Calculate volume    
            volumes.append(volume)
        
        return volumes