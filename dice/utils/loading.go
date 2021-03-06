package utils

import (
	"bufio"
	"crypto/tls"
	"errors"
	"fmt"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type LoadingFunctions interface {
	LoadTile(tile string, version string, folder string) (string, error)
	LoadTileS3(tile string, version string, folder string) (string, error)
	LoadTileDev(tile string, version string, folder string) (string, error)
	CleanJunk(folder string)
	LoadSuper(folder string) (string, error)
	LoadSuperS3(folder string) (string, error)
	LoadSuperDev(folder string) (string, error)
	LoadTestOutput(tile string, folder string) ([]byte, error)
	LoadTileSpec(tile string, version string) ([]byte, error)
	LoadTileSpecDev(tile string, version string) ([]byte, error)
	LoadTileSpecS3(tile string, version string) ([]byte, error)
	LoadHuSpec(hu string, version string) ([]byte, error)
	LoadHuSpecDev(hu string, version string) ([]byte, error)
	LoadHuSpecS3(hu string, version string) ([]byte, error)
}

type HttpClient interface {
	Do(req *http.Request) (*http.Response, error)
}

var Client HttpClient

func (dc *DiceConfig) LoadTile(tile string, version string, folder string) (string, error) {
	if dc.Mode == "dev" {
		dest, err := dc.LoadTileDev(tile, version, folder)
		if err != nil {
			dest, err = dc.LoadTileS3(tile, version, folder)
		}
		return dest, err
	} else {
		return dc.LoadTileS3(tile, version, folder)
	}
}

func initHttpClient() {
	config := &tls.Config{
		InsecureSkipVerify: true,
	}
	tr := &http.Transport{TLSClientConfig: config}
	Client = &http.Client{Transport: tr}

}

func (dc *DiceConfig) LoadTileS3(tile string, version string, folder string) (string, error) {
	//https://<bucket-name>.s3-<region>.amazonaws.com/tile/<tile name>/<tile version>/<tile name>.tgz
	tileUrl := fmt.Sprintf("https://%s.s3-%s.amazonaws.com/tile/%s/%s/%s.tgz",
		dc.BucketName,
		dc.Region,
		strings.ToLower(tile),
		version,
		strings.ToLower(tile))
	if Client == nil {
		initHttpClient()
	}
	destDir := dc.WorkHome + folder + "/lib/" + strings.ToLower(tile)
	tileSpecFile := destDir + "/tile-spec.yaml"

	req, err := http.NewRequest(http.MethodGet, tileUrl, nil)
	if err != nil {
		log.Printf("http.NewRequest was failed from %s with Err: %s. \n", tileUrl, err)
		return tileSpecFile, err
	}
	resp, err := Client.Do(req)
	if err != nil {
		log.Printf("API call was failed from %s with Err: %s. \n", tileUrl, err)
		return tileSpecFile, err
	}
	if resp.StatusCode != http.StatusOK {
		log.Errorf("response_code=%d, response_status= %s for %s\n", resp.StatusCode, resp.Status, tileUrl)
		return tileSpecFile, errors.New("failed to load tile :" + tile + "-" + version + " from repo")
	}

	return tileSpecFile, UnTarGz(destDir, bufio.NewReader(resp.Body))

}

func (dc *DiceConfig) LoadTileDev(tile string, version string, folder string) (string, error) {

	repoDir := dc.LocalRepo
	srcDir := repoDir + "/" + strings.ToLower(tile) + "/" + strings.ToLower(version)
	destDir := dc.WorkHome + folder + "/lib/" + strings.ToLower(tile)
	tileSpecFile := destDir + "/tile-spec.yaml"
	log.Printf("Load Tile < %s - %s > ... from < %s >\n", tile, version, dc.LocalRepo)

	return tileSpecFile, Copy(srcDir, destDir,
		Options{
			OnSymlink: func(src string) SymlinkAction {
				return Skip
			},
			Skip: func(src string) bool {
				return strings.Contains(src, "node_modules")
			},
		})

}

// CleanJunk removes all *.log / *.sh under super-*/
func (dc *DiceConfig) CleanJunk(folder string) {
	destDir := dc.WorkHome + folder
	if f, err := os.Stat(destDir); err == nil && f.IsDir() {
		for _, suffix := range []string{"*.sh", "*.log"} {
			files, err := filepath.Glob(destDir + "/" + suffix)
			if err == nil {
				for _, f := range files {
					os.Remove(f)
				}
			}
		}
		os.RemoveAll(destDir + "/lib")
	}

}
func (dc *DiceConfig) LoadSuper(folder string) (string, error) {

	dc.CleanJunk(folder)
	if dc.Mode == "dev" {
		dest, err := dc.LoadSuperDev(folder)
		if err != nil {
			dest, err = dc.LoadSuperS3(folder)
		}
		return dest, err
	} else {
		return dc.LoadSuperS3(folder)
	}
}

func (dc *DiceConfig) LoadSuperS3(folder string) (string, error) {
	//https://<bucket-name>.s3-<region>.amazonaws.com/tile/<tile name>/<tile version>/<tile name>.tgz
	tileUrl := fmt.Sprintf("https://%s.s3-%s.amazonaws.com/tile/%s/%s.tgz",
		dc.BucketName,
		dc.Region,
		"super",
		"super")
	if Client == nil {
		initHttpClient()
	}
	destDir := dc.WorkHome + folder

	req, err := http.NewRequest(http.MethodGet, tileUrl, nil)
	if err != nil {
		log.Printf("http.NewRequest was failed from %s with Err: %s. \n", tileUrl, err)
		return destDir, err
	}
	resp, err := Client.Do(req)
	if err != nil {
		log.Printf("API call was failed from %s with Err: %s. \n", tileUrl, err)
		return destDir, err
	}
	if resp.StatusCode != http.StatusOK {
		log.Errorf("response_code=%d, response_status= %s for %s\n", resp.StatusCode, resp.Status, tileUrl)
		return destDir, errors.New("failed to load super from repo")
	}
	return destDir, UnTarGz(destDir, bufio.NewReader(resp.Body))

}

func (dc *DiceConfig) LoadSuperDev(folder string) (string, error) {
	repoDir := dc.LocalRepo + "/super"
	destDir := dc.WorkHome + folder
	return destDir, Copy(repoDir, destDir)
}

func (dc *DiceConfig) LoadTestOutput(tile string, folder string) ([]byte, error) {
	testOutputFile := dc.WorkHome + folder + "/lib/" + strings.ToLower(tile) + "/test/" + tile + ".output"
	f, err := os.Open(testOutputFile)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	return ioutil.ReadAll(f)
}

func (dc *DiceConfig) LoadTileSpec(tile string, version string) ([]byte, error) {
	if dc.Mode == "dev" {
		dest, err := dc.LoadTileSpecDev(tile, version)
		if err != nil {
			dest, err = dc.LoadTileSpecS3(tile, version)
		}
		return dest, err
	} else {
		return dc.LoadTileSpecS3(tile, version)
	}
}

func (dc *DiceConfig) LoadTileSpecDev(tile string, version string) ([]byte, error) {
	repoDir := dc.LocalRepo
	srcDir := repoDir + "/" + strings.ToLower(tile) + "/" + strings.ToLower(version)
	tileSpecFile := srcDir + "/tile-spec.yaml"
	log.Printf("Load Tile < %s - %s > ... from < %s >\n", tile, version, dc.LocalRepo)

	return ioutil.ReadFile(tileSpecFile)

}

func (dc *DiceConfig) LoadTileSpecS3(tile string, version string) ([]byte, error) {
	tileUrl := fmt.Sprintf("https://%s.s3-%s.amazonaws.com/tile/%s/%s/tile-spec.yaml",
		dc.BucketName,
		dc.Region,
		strings.ToLower(tile),
		version)
	if Client == nil {
		initHttpClient()
	}
	req, err := http.NewRequest(http.MethodGet, tileUrl, nil)
	if err != nil {
		log.Printf("http.NewRequest was failed from %s with Err: %s. \n", tileUrl, err)
		return nil, err
	}
	resp, err := Client.Do(req)
	if err != nil {
		log.Printf("API call was failed from %s with Err: %s. \n", tileUrl, err)
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		log.Errorf("response_code=%d, response_status= %s for %s\n", resp.StatusCode, resp.Status, tileUrl)
		return nil, errors.New("failed to load tile :" + tile + "-" + version + " from repo")
	}
	return ioutil.ReadAll(resp.Body)
}

func (dc *DiceConfig) LoadHuSpec(hu string, version string) ([]byte, error) {
	if dc.Mode == "dev" {
		dest, err := dc.LoadHuSpecDev(hu, version)
		if err != nil {
			dest, err = dc.LoadHuSpecS3(hu, version)
		}
		return dest, err
	} else {
		return dc.LoadHuSpecS3(hu, version)
	}
}
func (dc *DiceConfig) LoadHuSpecDev(hu string, version string) ([]byte, error) {
	repoDir := dc.LocalRepo
	srcDir := repoDir + "../hu/" + strings.ToLower(hu) + "/" + version + "/"
	huSpecFile := srcDir + strings.ToLower(hu) + ".yaml"

	return ioutil.ReadFile(huSpecFile)
}
func (dc *DiceConfig) LoadHuSpecS3(hu string, version string) ([]byte, error) {
	huUrl := fmt.Sprintf("https://%s.s3-%s.amazonaws.com/hu/%s/%s/%s.yaml",
		dc.BucketName,
		dc.Region,
		strings.ToLower(hu),
		version,
		strings.ToLower(hu))
	if Client == nil {
		initHttpClient()
	}
	req, err := http.NewRequest(http.MethodGet, huUrl, nil)
	if err != nil {
		log.Printf("http.NewRequest was failed from %s with Err: %s. \n", huUrl, err)
		return nil, err
	}
	resp, err := Client.Do(req)
	if err != nil {
		log.Printf("API call was failed from %s with Err: %s. \n", huUrl, err)
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		log.Errorf("response_code=%d, response_status= %s for %s\n", resp.StatusCode, resp.Status, huUrl)
		return nil, errors.New("failed to load Hu :" + hu + "-" + version + " from repo")
	}
	return ioutil.ReadAll(resp.Body)
}
