import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",  // Изменили с "::" на "localhost"
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    // Копирование .htaccess после сборки
    {
      name: "copy-htaccess",
      closeBundle() {
        try {
          copyFileSync("public/.htaccess", "dist/.htaccess");
          console.log("✅ .htaccess скопирован в dist/");
        } catch (error) {
          console.warn("⚠️ Не удалось скопировать .htaccess:", error);
        }
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        // Добавляем хэши к именам файлов для правильного кэширования
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-accordion", "@radix-ui/react-dialog", "@radix-ui/react-select"],
        },
      },
    },
  },
}));