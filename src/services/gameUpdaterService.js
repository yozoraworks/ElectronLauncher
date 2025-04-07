import axios from 'axios';

// Function to check game version
export const checkGameVersion = async (gameName, installPath) => {
  try {
    if (!window.electron) {
      return { needsUpdate: false, error: 'Electron API not available' };
    }

    // Use the user-selected install path directly
    console.log(`Using install path for version check: ${installPath}`);

    const versionPath = `${installPath}/version.txt`;
    
    // Check if version.txt exists
    const versionExists = await window.electron.fileExists(versionPath);
    
    let currentVersion = '0.0.0';
    
    if (versionExists) {
      // Read version from file
      const versionContent = await window.electron.readFile(versionPath);
      currentVersion = versionContent.trim();
    } else {
      // Create version.txt with 0.0.0
      await window.electron.ensureDir(installPath);
      await window.electron.writeFile(versionPath, currentVersion);
    }
    
    return { 
      currentVersion,
      needsUpdate: true, // Will be compared with server version by caller
      error: null
    };
  } catch (error) {
    console.error('Error checking game version:', error);
    return { 
      currentVersion: '0.0.0', 
      needsUpdate: true,
      error: error.message || 'Failed to check game version'
    };
  }
};

// Function to download and parse the filelist
export const fetchFileList = async (filelistUrl) => {
  try {
    console.log(`Fetching file list from: ${filelistUrl}`);
    const response = await axios.get(filelistUrl);
    console.log(`Received file list response:`, response.data);
    
    const fileList = response.data.map(item => {
      return { 
        checksum: item.hash, 
        filePath: item.file
      };
    });
    
    console.log(`Parsed file list:`, fileList);
    return { success: true, fileList };
  } catch (error) {
    console.error('Error fetching file list:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to fetch file list'
    };
  }
};

// Function to calculate MD5 checksum of a file
const calculateMD5 = async (filePath) => {
  try {
    if (!window.electron) {
      throw new Error('Electron API not available');
    }
    
    // For this implementation, we're relying on Electron's backend
    // to calculate the MD5 hash since we can't use node's crypto in the browser
    const checksum = await window.electron.calculateMD5(filePath);
    return checksum;
  } catch (error) {
    console.error(`Error calculating checksum for ${filePath}:`, error);
    throw error;
  }
};

// Function to check which files need to be updated
export const checkFilesToUpdate = async (fileList, installPath) => {
  try {
    if (!window.electron) {
      throw new Error('Electron API not available');
    }

    console.log(`Checking files in: ${installPath}`);
    console.log(`File list to check:`, fileList);
    
    const filesToUpdate = [];
    
    // Normalize the install path to use forward slashes 
    const normalizedInstallPath = installPath.replace(/\\/g, '/');
    console.log(`Normalized install path: ${normalizedInstallPath}`);
    
    for (const file of fileList) {
      // Ensure file path uses forward slashes
      const normalizedFilePath = file.filePath.replace(/\\/g, '/');
      const filePath = `${normalizedInstallPath}/${normalizedFilePath}`;
      console.log(`Checking file: ${filePath}`);
      
      // Check if file exists
      const exists = await window.electron.fileExists(filePath);
      console.log(`File exists: ${exists}`);
      
      if (!exists) {
        // File doesn't exist, add to update list
        console.log(`File doesn't exist, adding to update list: ${file.filePath}`);
        filesToUpdate.push(file);
        continue;
      }
      
      // Calculate checksum
      try {
        const checksum = await calculateMD5(filePath);
        console.log(`Calculated checksum: ${checksum}, Expected: ${file.checksum}`);
        
        // Compare checksums
        if (checksum !== file.checksum) {
          console.log(`Checksum mismatch, adding to update list: ${file.filePath}`);
          filesToUpdate.push(file);
        }
      } catch (error) {
        // If there's an error calculating checksum, assume file needs update
        console.error(`Error calculating checksum for ${filePath}:`, error);
        console.log(`Adding to update list due to checksum error: ${file.filePath}`);
        filesToUpdate.push(file);
      }
    }
    
    console.log(`Files to update:`, filesToUpdate);
    return { success: true, filesToUpdate };
  } catch (error) {
    console.error('Error checking files to update:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to check files to update' 
    };
  }
};

// Function to download a file
export const downloadFile = async (downloadUrl, targetPath) => {
  try {
    if (!window.electron) {
      throw new Error('Electron API not available');
    }

    console.log(`Starting download from ${downloadUrl} to ${targetPath}`);

    // Make the request and get the array buffer
    console.log(`Making axios request to ${downloadUrl}`);
    const response = await axios({
      method: 'GET',
      url: downloadUrl,
      responseType: 'arraybuffer',
    });
    console.log(`Received response from ${downloadUrl}, data size: ${response.data.byteLength} bytes`);
    
    // Ensure the directory exists
    const directory = targetPath.substring(0, targetPath.lastIndexOf('/'));
    console.log(`Ensuring directory exists: ${directory}`);
    await window.electron.ensureDir(directory);
    
    // Write the file
    console.log(`Writing file to: ${targetPath}`);
    await window.electron.writeFileBinary(targetPath, response.data);
    console.log(`Successfully wrote file to: ${targetPath}`);
    
    return { success: true };
  } catch (error) {
    console.error(`Error downloading file ${downloadUrl}:`, error);
    return { 
      success: false, 
      error: error.message || 'Failed to download file' 
    };
  }
};

// Main function to update a game
export const updateGame = async (game, installPath, onProgress) => {
  try {
    if (!window.electron) {
      throw new Error('Electron API not available');
    }

    console.log(`Starting update process for game: ${game.name}`);
    console.log(`Using install path: ${installPath}`);
    
    // Ensure the game directory exists
    console.log(`Ensuring game directory exists: ${installPath}`);
    await window.electron.ensureDir(installPath);
    console.log(`Game directory ensured: ${installPath}`);

    // 1. Fetch the file list
    console.log(`Fetching file list from: ${game.filelistUrl}`);
    onProgress({ phase: 'fetch_filelist', progress: 0 });
    const fileListResult = await fetchFileList(game.filelistUrl);
    
    if (!fileListResult.success) {
      console.error(`Failed to fetch file list: ${fileListResult.error}`);
      return { 
        success: false, 
        error: fileListResult.error || 'Failed to fetch file list' 
      };
    }
    
    console.log(`File list fetched successfully, found ${fileListResult.fileList.length} files`);
    
    // 2. Check which files need to be updated
    console.log(`Checking which files need to be updated`);
    onProgress({ phase: 'check_files', progress: 0 });
    const fileCheckResult = await checkFilesToUpdate(fileListResult.fileList, installPath);
    
    if (!fileCheckResult.success) {
      console.error(`Failed to check files: ${fileCheckResult.error}`);
      return { 
        success: false, 
        error: fileCheckResult.error || 'Failed to check files' 
      };
    }
    
    const { filesToUpdate } = fileCheckResult;
    console.log(`Found ${filesToUpdate.length} files to update`);
    
    // If no files need updating, we're done
    if (filesToUpdate.length === 0) {
      console.log(`No files to update, updating version file only`);
      // Update version file
      await window.electron.writeFile(
        `${installPath}/version.txt`, 
        game.version
      );
      console.log(`Version file updated to ${game.version}`);
      
      return { success: true };
    }
    
    // 3. Download each file
    console.log(`Starting download of ${filesToUpdate.length} files`);
    onProgress({ phase: 'download', progress: 0, totalFiles: filesToUpdate.length });
    
    for (let i = 0; i < filesToUpdate.length; i++) {
      const file = filesToUpdate[i];
      const targetPath = `${installPath}/${file.filePath}`;
      const downloadUrl = `${game.downloadBucketUrl}${file.filePath}`;
      
      console.log(`Downloading file ${i+1}/${filesToUpdate.length}: ${file.filePath}`);
      console.log(`From: ${downloadUrl}`);
      console.log(`To: ${targetPath}`);
      
      onProgress({ 
        phase: 'download', 
        progress: i / filesToUpdate.length, 
        currentFile: file.filePath,
        currentFileIndex: i,
        totalFiles: filesToUpdate.length
      });
      
      const downloadResult = await downloadFile(downloadUrl, targetPath);
      console.log(`Download result for ${file.filePath}: ${downloadResult.success ? 'Success' : 'Failed'}`);
      
      if (!downloadResult.success) {
        console.error(`Failed to download file ${file.filePath}: ${downloadResult.error}`);
        return { 
          success: false, 
          error: `Failed to download file: ${file.filePath}` 
        };
      }
    }
    
    // 4. Update version file
    console.log(`All files downloaded successfully, updating version file to ${game.version}`);
    await window.electron.writeFile(
      `${installPath}/version.txt`, 
      game.version
    );
    console.log(`Version file updated`);
    
    onProgress({ phase: 'complete', progress: 1 });
    console.log(`Update process completed successfully!`);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating game:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred during update' 
    };
  }
};