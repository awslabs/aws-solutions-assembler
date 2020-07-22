package deploy

import (
	"github.com/kris-nova/logger"
	"github.com/spf13/cobra"
	"io/ioutil"
	"mctl/cmd"
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
	buf, err := ioutil.ReadFile(filename)
	if err != nil {
		logger.Warning("%s\n", err)
		return
	}
	if err = cmd.Run(addr, dryRun, parallel, buf); err != nil {
		logger.Warning("%s\n", err)
		return
	}

}
