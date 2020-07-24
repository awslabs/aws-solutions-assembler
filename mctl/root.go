package main

import (
	"github.com/spf13/cobra"
	"mctl/cmd/deploy"
	"mctl/cmd/describe"
	"mctl/cmd/initial"
	"mctl/cmd/list"
	"mctl/cmd/validate"
	"mctl/cmd/version"
)

func NewRootCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "mctl",
		Short: "The official CLI for Mahjong",
	}

	// Initial commands
	cmd.AddCommand(initial.Init,
		validate.Validate,
		deploy.Deploy,
		version.Version,
		list.Repo,
		describe.Desc)
	cmd.TraverseChildren = true

	// Root flag for Dice's address
	cmd.PersistentFlags().String("addr", "127.0.0.1:9090", "Dice's address & port, default : 127.0.0.1:9090")
	addr := cmd.PersistentFlags().Lookup("addr")
	addr.Shorthand = "s"

	// dry-run
	cmd.PersistentFlags().Bool("dry-run", false, "Only print out the yaml that would be executed")

	// parallel execution
	cmd.PersistentFlags().Bool("parallel", false, "Deployment would be executed with parallel manner")
	parallel := cmd.PersistentFlags().Lookup("parallel")
	parallel.Shorthand = "p"

	return cmd
}
