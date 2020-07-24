package deploy

import (
	"crypto/tls"
	"github.com/kris-nova/logger"
	"github.com/spf13/cobra"
	"io/ioutil"
	"mctl/cmd"
	"net/http"
	"net/url"
	"os"
)

var Deploy = &cobra.Command{
	Use:   "deploy",
	Short: "\tDeploy Tile/Deployment to target platform.",
	Long:  "\tDeploy Tile/Deployment to target platform as per definition",
	Run: func(cmd *cobra.Command, args []string) {
		deployFunc(cmd, args)
	},
}

func init() {
	Deploy.PersistentFlags().StringP("filename", "f", "", "that contains the configuration to be applied")
	if err := Deploy.MarkPersistentFlagRequired("filename"); err != nil {
		logger.Warning("%s\n", err)
	}
}

func deployFunc(c *cobra.Command, args []string) {

	filename, _ := c.Flags().GetString("filename")
	addr, _ := c.Flags().GetString("addr")
	dryRun, _ := c.Flags().GetBool("dry-run")
	parallel, _ := c.Flags().GetBool("parallel")
	url, err := url.Parse(filename)
	if err == nil && url.Scheme != "" {
		//logger.Info(url.Scheme)
		if url.Scheme == "https" || url.Scheme == "http" {
			client := initHttpClient()
			response, err := client.Get(filename)
			if response.StatusCode != 200 || err != nil {
				logger.Critical("%s\n", err)
				os.Exit(1)
			} else {
				buf, err := ioutil.ReadAll(response.Body)
				if err != nil {
					logger.Critical("%s\n", err)
					os.Exit(1)
				}
				logger.Info("%s\n", string(buf))
				if err = cmd.Run(addr, dryRun, parallel, buf); err != nil {
					logger.Critical("%s\n", err)
					os.Exit(1)
				}
			}

		}

	} else {
		buf, err := ioutil.ReadFile(filename)
		if err != nil {
			logger.Critical("%s\n", err)
			os.Exit(1)
		}
		if err = cmd.Run(addr, dryRun, parallel, buf); err != nil {
			logger.Critical("%s\n", err)
			os.Exit(1)
		}
	}

}

func initHttpClient() *http.Client {
	config := &tls.Config{
		InsecureSkipVerify: true,
	}
	tr := &http.Transport{TLSClientConfig: config}
	return &http.Client{Transport: tr}

}
