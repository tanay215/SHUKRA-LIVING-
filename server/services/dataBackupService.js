import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import DataBackup from '../models/DataBackup.js';
import fs from 'fs/promises';
import path from 'path';

class DataBackupService {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
  }

  async createBackup() {
    try {
      console.log('💾 Creating data backup...');

      const products = await Product.find().lean();
      const settings = await Settings.findOne().lean();

      const backup = {
        timestamp: new Date(),
        products: products,
        settings: settings,
        productCount: products.length,
        status: 'completed'
      };

      await DataBackup.create(backup);

      console.log(`✅ Backup created with ${products.length} products`);
      return backup;
    } catch (error) {
      console.error('❌ Backup creation error:', error);
      throw error;
    }
  }

  async restoreFromBackup(backupId) {
    try {
      console.log(`🔄 Restoring from backup ${backupId}...`);

      const backup = await DataBackup.findById(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      await Product.deleteMany({});
      if (backup.products && backup.products.length > 0) {
        await Product.insertMany(backup.products);
      }

      if (backup.settings) {
        await Settings.deleteMany({});
        await Settings.create(backup.settings);
      }

      console.log(`✅ Restored ${backup.productCount} products from backup`);
      return backup;
    } catch (error) {
      console.error('❌ Restore error:', error);
      throw error;
    }
  }

  async getLatestBackup() {
    try {
      const backup = await DataBackup.findOne().sort({ timestamp: -1 });
      return backup;
    } catch (error) {
      console.error('❌ Get latest backup error:', error);
      return null;
    }
  }

  async listBackups(limit = 10) {
    try {
      const backups = await DataBackup.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .select('timestamp productCount status');
      return backups;
    } catch (error) {
      console.error('❌ List backups error:', error);
      return [];
    }
  }

  async deleteOldBackups(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await DataBackup.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      console.log(`✅ Deleted ${result.deletedCount} old backups`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Delete old backups error:', error);
      return 0;
    }
  }
}

export default new DataBackupService();
